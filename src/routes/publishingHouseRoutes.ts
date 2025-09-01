import express from "express";
import publishingHouseController from "../controllers/publishingHouseController";
const router = express.Router();

/**
 * @swagger
 * /publishingHouses:
 *   get:
 *     summary: Get all publishing houses with their books
 *     tags: [PublishingHouses]
 *     responses:
 *       200:
 *         description: List of publishing houses with their books
 */
router.get("/", publishingHouseController.getAllPublishingHouses);

/**
 * @swagger
 * /publishingHouses/sorted:
 *   get:
 *     summary: Get publishing houses sorted by name
 *     tags: [PublishingHouses]
 *     responses:
 *       200:
 *         description: List of publishing houses sorted by name
 */
router.get(
  "/sorted",
  publishingHouseController.getPublishingHousesSortedByName
);

/**
 * @swagger
 * /publishingHouses/contains:
 *   get:
 *     summary: Search publishing houses by name
 *     tags: [PublishingHouses]
 *     parameters:
 *       - in: query
 *         name: text
 *         schema:
 *           type: string
 *         required: true
 *         description: Text to search in publishing house names
 *     responses:
 *       200:
 *         description: List of matching publishing houses
 */
router.get(
  "/contains",
  publishingHouseController.getPublishingHousesByNameContain
);

/**
 * @swagger
 * /publishingHouses/withTotalBooks:
 *   get:
 *     summary: Get all publishing houses with their total number of books
 *     tags: [PublishingHouses]
 *     responses:
 *       200:
 *         description: List of publishing houses with book counts
 */
router.get(
  "/withTotalBooks",
  publishingHouseController.getPublishingHousesWithTotalBooks
);

/**
 * @swagger
 * /publishingHouses:
 *   post:
 *     summary: Create a new publishing house
 *     tags: [PublishingHouses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - namePublishingHouse
 *             properties:
 *               namePublishingHouse:
 *                 type: string
 *     responses:
 *       201:
 *         description: Publishing house created successfully
 */
router.post("/", publishingHouseController.post);

/**
 * @swagger
 * /publishingHouses/{id}:
 *   get:
 *     summary: Get a publishing house by ID
 *     tags: [PublishingHouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: Publishing house ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Publishing house details
 */
router.get("/:id", publishingHouseController.getPublishingHouse);

/**
 * @swagger
 * /publishingHouses/{id}:
 *   put:
 *     summary: Update a publishing house by ID
 *     tags: [PublishingHouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: Publishing house ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               namePublishingHouse:
 *                 type: string
 *     responses:
 *       200:
 *         description: Publishing house updated successfully
 */
router.put("/:id", publishingHouseController.put);

/**
 * @swagger
 * /publishingHouses/{id}:
 *   delete:
 *     summary: Delete a publishing house by ID
 *     tags: [PublishingHouses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: ObjectId
 *         description: Publishing house ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Publishing house deleted successfully
 */
router.delete("/:id", publishingHouseController.delete);

export default router;
