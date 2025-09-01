import { Request, Response } from "express";
import {
  IPublishingHouse,
  PublishingHouseModel,
} from "../models/publishingHouseModel";

class PublishingHouseController {
  constructor() {}

  // List all publishers with their books
  async getAllPublishingHouses(req: Request, res: Response) {
    try {
      const publishingHouses = await PublishingHouseModel.find().populate(
        "books"
      );
      res.json(publishingHouses);
    } catch (error) {
      res.status(500).json({
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  }

  // Get a publisher for ID with your books
  async getPublishingHouse(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ message: "The 'id' parameter is required" });
    }
    try {
      const publishingHouse = await PublishingHouseModel.findById(id).populate(
        "books"
      );
      if (!publishingHouse) {
        return res.status(404).json({ message: "Publisher not found" });
      }
      return res.json(publishingHouse);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  // Create a new publishing house
  async post(req: Request, res: Response) {
    const { namePublishingHouse } = req.body;
    
    if (!namePublishingHouse) {
      return res.status(400).json({ message: "namePublishingHouse is required" });
    }
    
    try {
      const newPublishingHouse = await PublishingHouseModel.create({
        name: namePublishingHouse,
      });
      return res.status(201).json(newPublishingHouse);
    } catch (error) {
      console.error('Error creating publishing house:', error);
      return res.status(500).json({
        message:
          error instanceof Error ? error.message : "Error creating publisher",
      });
    }
  }

  // Update an existing publisher by id
  async put(req: Request, res: Response) {
    const { id } = req.params;
    const { namePublishingHouse: name } = req.body; // Extract namePublishingHouse as name
    if (!id) {
      return res
        .status(400)
        .json({ message: "The 'id' parameter is required" });
    }
    try {
      const updatedPublishingHouse =
        await PublishingHouseModel.findByIdAndUpdate(
          id,
          { name },
          { new: true }
        );
      if (!updatedPublishingHouse) {
        return res.status(404).json({ message: "Publisher not found" });
      }
      return res.json(updatedPublishingHouse);
    } catch (error) {
      return res.status(500).json({ message: "Error updating the publisher" });
    }
  }

  // Delete an existing publisher by id
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ message: "The 'id' parameter is required" });
    }
    try {
      const deletedPublishingHouse =
        await PublishingHouseModel.findByIdAndDelete(id);
      if (!deletedPublishingHouse) {
        return res.status(404).json({ message: "Publisher not found" });
      }
      return res.json({ message: "Editorial successfully removed" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting publisher" });
    }
  }

  // Get publishers sorted by name (ascending or descending)
  async getPublishingHousesSortedByName(req: Request, res: Response) {
    // up can come as a query param: /publishingHouse/sorted?up=true
    const up = req.query.up === "false" ? -1 : 1; // ascending default

    try {
      const publishingHouses = await PublishingHouseModel.find()
        .sort({ name: up })
        .populate("books");
      return res.json(publishingHouses);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error getting the ordered publishers" });
    }
  }

  // Get publishers whose name contains text (case insensitive)
  async getPublishingHousesByNameContain(req: Request, res: Response) {
    const { text } = req.query;
    if (typeof text !== "string" || !text.trim()) {
      return res
        .status(400)
        .json({ message: "The 'text' parameter is required" });
    }
    try {
      const publishingHouses = await PublishingHouseModel.find({
        name: { $regex: text, $options: "i" },
      }).populate("books");
      return res.json(publishingHouses);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error searching for publishers" });
    }
  }

  // Get all publishers with the total number of books from each one
  async getPublishingHousesWithTotalBooks(req: Request, res: Response) {
    try {
      const publishingHouses = await PublishingHouseModel.find().populate(
        "books"
      );
      const result = publishingHouses.map((ph: IPublishingHouse) => ({
        idPublishingHouse: ph._id,
        namePublishingHouse: ph.name,
        totalBooks: ph.books ? ph.books.length : 0,
      }));
      return res.json(result);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error getting publishers with total books" });
    }
  }
}

export default new PublishingHouseController();
