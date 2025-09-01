import { Request, Response } from "express";
import { AuthorModel, IAuthor } from "../models/authorModel";

class AuthorController {
  constructor() {}

  // List all authors with their books
  async getAllAuthorsWithBooks(req: Request, res: Response) {
    try {
      const authors = await AuthorModel.find().populate("books");
      return res.json(authors);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  // Get an author ID with their books
  async getAuthorWithBooks(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        message: "The 'id' parameter is required",
      });
    }
    try {
      const author = await AuthorModel.findById(id).populate("books");
      if (!author) {
        return res.status(404).json({ message: "Author not found" });
      }
      return res.json(author);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  // Get authors sorted by name (ascending or descending)
  async getAuthorsSortedByName(req: Request, res: Response) {
    const up = req.query.up === "false" ? -1 : 1; // ascending default
    try {
      const authors = await AuthorModel.find()
        .sort({ name: up })
        .populate("books");
      return res.json(authors);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error getting the sorted authors" });
    }
  }

  // Get authors whose name contains a text (case insensitive)
  async getAuthorsByNameContain(req: Request, res: Response) {
    const { text } = req.query;
    if (typeof text !== "string" || !text.trim()) {
      return res
        .status(400)
        .json({ message: "The 'text' parameter is required" });
    }
    try {
      const authors = await AuthorModel.find({
        name: { $regex: text, $options: "i" },
      }).populate("books");
      return res.json(authors);
    } catch (error) {
      return res.status(500).json({ message: "Error searching for authors" });
    }
  }

  // Get authors with total books
  async getAuthorsWithTotalBooks(req: Request, res: Response) {
    try {
      const authors = await AuthorModel.find().populate("books");
      const result = authors.map((author: IAuthor) => ({
        idAuthor: author._id,
        nameAuthor: author.name,
        totalBooks: author.books ? author.books.length : 0,
      }));
      return res.json(result);
    } catch (error) {
      console.error("Error in getAuthorsWithTotalBooks:", error);
      return res
        .status(500)
        .json({ message: "Error getting authors with total books" });
    }
  }

  // Create a new author
  async post(req: Request, res: Response) {
    const { nameAuthor } = req.body;
    if (typeof nameAuthor !== "string" || !nameAuthor.trim()) {
      return res
        .status(400)
        .json({ message: "The 'nameAuthor' field is required" });
    }
    try {
      const newAuthor = await AuthorModel.create({ name: nameAuthor });
      return res.status(201).json({
        ...newAuthor.toObject(),
        nameAuthor: newAuthor.name
      });
    } catch (error) {
      console.error('Error creating author:', error);
      return res.status(500).json({ 
        message: error instanceof Error ? error.message : "Error creating author" 
      });
    }
  }

  // Update an existing author by id
  async put(req: Request, res: Response) {
    const { id } = req.params;
    const { nameAuthor: name } = req.body; // Extract nameAuthor as name
    try {
      const author = await AuthorModel.findByIdAndUpdate(
        id,
        { name },
        { new: true }
      );
      if (!author) {
        return res.status(404).json({ message: "Author not found" });
      }
      return res.json(author);
    } catch (error) {
      return res.status(500).json({ message: "Error updating author" });
    }
  }

  // Delete an existing author by id
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const author = await AuthorModel.findByIdAndDelete(id);
      if (!author) {
        return res.status(44).json({ message: "Author not found" });
      }
      return res.json({ message: "Author successfully removed" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting author" });
    }
  }
}

export default new AuthorController();