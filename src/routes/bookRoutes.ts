import express from "express";
import bookController from "../controllers/bookController";
import { upload } from "../controllers/bookController";
const router = express.Router();

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books with their relationships
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: A list of all books with their author and publishing house details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
router.get("/", bookController.getAllBooks);
router.get("/sorted", bookController.getBooksSortedByTitle);
router.get("/contains", bookController.getBooksByTitleContain);
router.get("/author/:id_author", bookController.getBooksByAuthor);
router.get("/prices", bookController.getBooksAndPrices);
router.get("/grouped/discontinued", bookController.getBooksGroupedByDiscontinued);
router.get("/by-price", bookController.getBooksByPrice);
router.get("/withTotalAuthors", bookController.getBooksWithTotalAuthors);

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - pages
 *               - price
 *               - authorId
 *               - publishingHouseId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Title of the book
 *               pages:
 *                 type: number
 *                 description: Number of pages
 *                 minimum: 1
 *               price:
 *                 type: number
 *                 description: Price of the book
 *                 minimum: 0
 *               discontinued:      
 *                 type: boolean
 *                 description: Whether the book is discontinued
 *                 default: false
 *               authorId:
 *                 type: string
 *                 description: ID of the author
 *               publishingHouseId:
 *                 type: string
 *                 description: ID of the publishing house
 *               photoCover:
 *                 type: string
 *                 format: binary
 *                 description: Cover image of the book
 *     responses:
 *       201:
 *         description: Book created successfully
 */
router.post("/", upload.single("photoCover"), bookController.post);

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               pages:
 *                 type: number
 *               price:
 *                 type: number
 *               discontinued:
 *                 type: boolean
 *               authorId:
 *                 type: string
 *               publishingHouseId:
 *                 type: string
 *               photoCover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Book updated successfully
 */
router.put("/:id", upload.single("photoCover"), bookController.put);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book by id
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 */
router.delete("/:id", bookController.delete);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 */
router.get("/:id", bookController.getBook);

export default router;
