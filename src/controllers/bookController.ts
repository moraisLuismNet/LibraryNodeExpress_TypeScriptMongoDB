import { Request, Response } from "express";
import { BookModel } from "../models/bookModel";
import { AuthorModel } from "../models/authorModel";
import { PublishingHouseModel } from "../models/publishingHouseModel";
import multer, { StorageEngine } from "multer";
import { Request as ExpressRequest } from "express";

// Configuring multer to save files to the 'uploads/' folder
const storage: StorageEngine = multer.diskStorage({
  destination: function (req: ExpressRequest, file: Express.Multer.File, cb) {
    cb(null, "uploads/");
  },
  filename: function (req: ExpressRequest, file: Express.Multer.File, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage });

class BookController {
  constructor() {}

  // List all books with their relationships
  async getAllBooks(req: Request, res: Response) {
    try {
      const books = await BookModel.find()
        .populate('author')
        .populate('publishingHouse')
        .lean();
      return res.json(books);
    } catch (error) {
      console.error('Error getting books:', error);
      return res.status(500).json({ message: "Error getting books" });
    }
  }

  // Get books by author
  async getBooksByAuthor(req: Request, res: Response) {
    const { id_author } = req.params;
    
    try {
      // First verify the author exists
      const author = await AuthorModel.findById(id_author);
      if (!author) {
        return res.status(404).json({ message: "Author not found" });
      }
      
      const books = await BookModel.find({ author: id_author })
        .populate('author')
        .populate('publishingHouse')
        .lean();
      
      return res.json(books);
    } catch (error) {
      console.error('Error getting books by author:', error);
      return res.status(500).json({ message: "Error getting books by author" });
    }
  }

  // Get a book by ID
  async getBook(req: Request, res: Response) {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        message: "The 'id' parameter is required",
      });
    }
    
    try {
      const book = await BookModel.findById(id)
        .populate('author')
        .populate('publishingHouse')
        .lean();
        
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      return res.json(book);
    } catch (error) {
      return res.status(500).json({ message: "Error getting the book" });
    }
  }

  // Create a new book
  async post(
    req: ExpressRequest & { file?: Express.Multer.File },
    res: Response
  ) {
    // Extract text and file fields
    let { title, pages, price, discontinued, authorId, publishingHouseId } = req.body;
    const photoCover = req.file ? req.file.filename : undefined;
    
    // Convert types
    pages = pages !== undefined ? Number(pages) : undefined;
    price = price !== undefined ? Number(price) : undefined;
    discontinued = discontinued === "true" || discontinued === true;

    // Validate required fields
    if (!title || pages === undefined || price === undefined || !authorId || !publishingHouseId) {
      return res.status(400).json({ 
        message: "title, pages, price, authorId, and publishingHouseId are required" 
      });
    }

    try {
      // Check if author and publishing house exist
      const [author, publishingHouse] = await Promise.all([
        AuthorModel.findById(authorId),
        PublishingHouseModel.findById(publishingHouseId)
      ]);

      if (!author || !publishingHouse) {
        return res.status(400).json({ 
          message: "Author or Publishing House not found" 
        });
      }

      const newBook = new BookModel({
        title,
        pages,
        price,
        photoCover,
        discontinued,
        author: author._id,
        publishingHouse: publishingHouse._id,
      });

      const savedBook = await newBook.save();
      
      // Add the book to the author's books array
      await AuthorModel.findByIdAndUpdate(
        author._id,
        { $addToSet: { books: savedBook._id } }
      );
      
      // Add the book to the publishing house's books array
      await PublishingHouseModel.findByIdAndUpdate(
        publishingHouse._id,
        { $addToSet: { books: savedBook._id } }
      );
      
      // Populate the references before returning
      const populatedBook = await BookModel.findById(savedBook._id)
        .populate('author')
        .populate('publishingHouse')
        .lean();

      return res.status(201).json(populatedBook);
    } catch (error: any) {
      console.error('Error creating book:', error);
      return res.status(500).json({ message: "Error creating book" });
    }
  }

  // Update an existing book by ID
  async put(
    req: ExpressRequest & { file?: Express.Multer.File },
    res: Response
  ) {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        message: "The request body is required and must be a JSON or form-data object.",
      });
    }

    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "The 'id' parameter is required",
      });
    }

    try {
      // Find the existing book
      const existingBook = await BookModel.findById(id);
      if (!existingBook) {
        return res.status(404).json({ message: "Book not found" });
      }

      // Extract and process fields
      const { title, pages, price, discontinued, authorId, publishingHouseId } = req.body;
      const photoCover = req.file ? req.file.filename : undefined;

      // Prepare update object with only provided fields
      const updateData: any = {};
      
      if (title !== undefined) updateData.title = title;
      if (pages !== undefined) updateData.pages = Number(pages);
      if (price !== undefined) updateData.price = Number(price);
      if (photoCover !== undefined) updateData.photoCover = photoCover;
      if (discontinued !== undefined) {
        updateData.discontinued = discontinued === "true" || discontinued === true;
      }

      // Check and update author reference if provided
      if (authorId) {
        const author = await AuthorModel.findById(authorId);
        if (!author) {
          return res.status(400).json({ message: "Author not found" });
        }
        updateData.author = author._id;
      }

      // Check and update publishing house reference if provided
      if (publishingHouseId) {
        const publishingHouse = await PublishingHouseModel.findById(publishingHouseId);
        if (!publishingHouse) {
          return res.status(400).json({ message: "Publishing house not found" });
        }
        updateData.publishingHouse = publishingHouse._id;
      }

      // Update the book
      const updatedBook = await BookModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
      .populate('author')
      .populate('publishingHouse')
      .lean();

      if (!updatedBook) {
        return res.status(404).json({ message: "Book not found after update" });
      }

      return res.json(updatedBook);
    } catch (error: any) {
      console.error('Error updating book:', error);
      if (error.code === 11000) {
        return res.status(400).json({ message: "A book with this ISBN already exists" });
      }
      return res.status(500).json({ message: "Error updating the book" });
    }
  }

  // Delete an existing book by ID
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        message: "The 'id' parameter is required",
      });
    }
    
    try {
      // Find the book first to get the author reference
      const book = await BookModel.findById(id);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Delete the book
      const deletedBook = await BookModel.findByIdAndDelete(id);
      
      // Remove the book reference from the author's books array
      if (book.author) {
        await AuthorModel.findByIdAndUpdate(
          book.author,
          { $pull: { books: book._id } }
        );
      }
      
      // Remove the book reference from the publishing house's books array
      if (book.publishingHouse) {
        await PublishingHouseModel.findByIdAndUpdate(
          book.publishingHouse,
          { $pull: { books: book._id } }
        );
      }
      
      return res.json({ message: "Book successfully deleted" });
    } catch (error) {
      console.error('Error deleting book:', error);
      return res.status(500).json({ message: "Error deleting book" });
    }
  }

  // Get books sorted by title (ascending or descending)
  async getBooksSortedByTitle(req: Request, res: Response) {
    const sortOrder = req.query.up === "false" ? -1 : 1; // 1 for ascending, -1 for descending
    
    try {
      const books = await BookModel.find()
        .sort({ title: sortOrder })
        .populate('author')
        .populate('publishingHouse')
        .lean();
      
      return res.json(books);
    } catch (error) {
      console.error('Error getting sorted books:', error);
      return res.status(500).json({ message: "Error getting the sorted books" });
    }
  }

  // Get books whose title contains text (case insensitive)
  async getBooksByTitleContain(req: Request, res: Response) {
    const { text } = req.query;
    
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ 
        message: "The 'text' parameter is required" 
      });
    }
    
    try {
      const books = await BookModel.find({
        title: { $regex: text, $options: 'i' }
      })
      .populate('author')
      .populate('publishingHouse')
      .lean();
      
      return res.json(books);
    } catch (error) {
      console.error('Error searching books by title:', error);
      return res.status(500).json({ message: "Error searching for books" });
    }
  }

  // Get only isbn, title and price of all books
  async getBooksAndPrices(req: Request, res: Response) {
    try {
      const books = await BookModel.find(
        {},
        { isbn: 1, title: 1, price: 1, _id: 0 }
      ).lean();
      
      return res.json(books);
    } catch (error) {
      console.error('Error getting books and prices:', error);
      return res.status(500).json({ message: "Error getting books and prices" });
    }
  }

  // Get books grouped by the discontinued field
  async getBooksGroupedByDiscontinued(req: Request, res: Response) {
    try {
      // Get all books with populated author and publishing house
      const books = await BookModel.find()
        .populate('author')
        .populate('publishingHouse')
        .lean();
      
      // Create a type for the lean document
      type LeanBook = {
        _id: any;
        title: string;
        pages: number;
        price: number;
        photoCover?: string;
        discontinued: boolean;
        author: any;
        publishingHouse: any;
        createdAt: Date;
        updatedAt: Date;
      };

      // Group by discontinued status
      const grouped = books.reduce<{ 
        discontinued: LeanBook[]; 
        available: LeanBook[] 
      }>((acc, book) => {
        if (book.discontinued) {
          acc.discontinued.push(book as LeanBook);
        } else {
          acc.available.push(book as LeanBook);
        }
        return acc;
      }, { 
        discontinued: [], 
        available: [] 
      });
      
      return res.json(grouped);
    } catch (error) {
      console.error('Error getting grouped books:', error);
      return res.status(500).json({ message: "Error getting grouped books" });
    }
  }

  // Get books whose price is between min and max
  async getBooksByPrice(req: Request, res: Response) {
    const min = parseFloat(req.query.min as string);
    const max = parseFloat(req.query.max as string);
    
    if (isNaN(min) || isNaN(max)) {
      return res.status(400).json({
        message: "The 'min' and 'max' parameters are required and must be numbers.",
      });
    }
    
    try {
      const books = await BookModel.find({
        price: { $gte: min, $lte: max }
      })
      .populate('author')
      .populate('publishingHouse')
      .lean();
      
      return res.json(books);
    } catch (error) {
      console.error('Error searching books by price:', error);
      return res.status(500).json({ message: "Error searching for books by price" });
    }
  }

  // Get all books with total authors
  async getBooksWithTotalAuthors(req: Request, res: Response) {
    try {
      const books = await BookModel.aggregate([
        {
          $lookup: {
            from: 'authors',
            localField: 'author',
            foreignField: '_id',
            as: 'authorInfo'
          }
        },
        {
          $project: {
            idBook: '$isbn',
            title: 1,
            totalAuthors: { $cond: [{ $ifNull: ['$author', false] }, 1, 0] }
          }
        }
      ]);
      
      return res.json(books);
    } catch (error) {
      console.error('Error getting books with total authors:', error);
      return res.status(500).json({ message: "Error getting books with total authors" });
    }
  }
}

export default new BookController();
