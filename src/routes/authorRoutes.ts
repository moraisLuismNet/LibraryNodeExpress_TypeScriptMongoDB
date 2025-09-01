import express from "express";
import authorController from "../controllers/authorController";
const router = express.Router();

/**
 * @swagger
 * /authors:
 *   get:
 *     summary: Get all authors with their books
 *     tags: [Authors]
 *     responses:
 *       200:
 *         description: List of authors with their books
 */
router.get("/", authorController.getAllAuthorsWithBooks);

/**
 * @swagger
 * /authors/sorted:
 *   get:
 *     summary: Get authors sorted by name
 *     tags: [Authors]
 *     responses:
 *       200:
 *         description: List of authors sorted by name
 */
router.get("/sorted", authorController.getAuthorsSortedByName);

/**
 * @swagger
 * /authors/contains:
 *   get:
 *     summary: Search authors by name
 *     tags: [Authors]
 *     parameters:
 *       - in: query
 *         name: text
 *         schema:
 *           type: string
 *         required: true
 *         description: Text to search in author names
 *     responses:
 *       200:
 *         description: List of matching authors
 */
router.get("/contains", authorController.getAuthorsByNameContain);

/**
 * @swagger
 * /authors:
 *   post:
 *     summary: Create a new author
 *     tags: [Authors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nameAuthor
 *             properties:
 *               nameAuthor:
 *                 type: string
 *     responses:
 *       201:
 *         description: Author created successfully
 */
router.post("/", authorController.post);

/**
 * @swagger
 * /authors/{id}:
 *   put:
 *     summary: Update an author by ID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: Author ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nameAuthor
 *             properties:
 *               nameAuthor:
 *                 type: string
 *                 description: The new name for the author
 *     responses:
 *       200:
 *         description: Author updated successfully
 */
router.put("/:id", authorController.put);

/**
 * @swagger
 * /authors/{id}:
 *   delete:
 *     summary: Delete an author by ID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: Author ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Author deleted successfully
 */
router.delete("/:id", authorController.delete);

/**
 * @swagger
 * /authors/withTotalBooks:
 *   get:
 *     summary: Get all authors with their total number of books
 *     tags: [Authors]
 *     responses:
 *       200:
 *         description: List of authors with book counts
 */
router.get("/withTotalBooks", authorController.getAuthorsWithTotalBooks);

/**
 * @swagger
 * /authors/{id}:
 *   get:
 *     summary: Get an author by ID with their books
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: Author ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Author details with books
 */
router.get("/:id", authorController.getAuthorWithBooks);

export default router;
