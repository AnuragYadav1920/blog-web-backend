import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const SubscribeAndUnsubscribe = asyncHandler(async (req, res) => {
  try {
    const { subscribeTo } = req.body;
    const subscriber = req.user._id;

    // Check if the user is already subscribed to the channel
    const existingSubscription = await Subscription.findOne({
      subscriber: subscriber,
      subscribedTo: subscribeTo,
    });

    if (existingSubscription) {
      // Unsubscribe by deleting the existing subscription
      await Subscription.findOneAndDelete({
        subscriber: subscriber,
        subscribedTo: subscribeTo,
      });

      return res.status(200).json(new apiResponse(200,{subscribed:false}, "Unsubscribed successfully"));
    }

    // Create a new subscription if not already subscribed
    await Subscription.create({
      subscriber: subscriber,
      subscribedTo: subscribeTo,
    });

    return res.status(200).json(new apiResponse(200,{subscribed: true}, "Subscribed successfully"));
  } catch (error) {
    console.error(error); 
    throw new apiError(500, "Server error");
  }
});

const getUserTotalSubscribers = asyncHandler(async (req, res) => {
  try {
    const totalSubscribers = await Subscription.countDocuments({
      subscribedTo: req.params.id,
    });

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          { totalSubscribers: totalSubscribers },
          "total subscribers fetched Successfully"
        )
      );
  } catch (error) {
    throw new apiError(500, "Server error");
  }
});

const checkSubscribed = asyncHandler(async (req, res) => {
  const subscribeTo = req.params.id;
  const isSubscribed = await Subscription.findOne({
    subscriber: req.user._id,
    subscribedTo: subscribeTo,
  });
  if (!isSubscribed) {
    return res
      .status(200)
      .json(new apiResponse(200, { subscribed: false }, "Not Subscribed"));
  }
  return res
    .status(200)
    .json(new apiResponse(200, { subscribed: true }, "Already Subscribed"));
});

const getTopCreators = asyncHandler(async (req, res) => {
  try {
    const topCreators = await Subscription.aggregate([ 
      {
        $group: {
          _id: "$subscribedTo",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "channelDetails",
        },
      },
      {
        $unwind: "$channelDetails",  
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]);

    return res
      .status(200)
      .json(
        new apiResponse(200, topCreators, "top creators fetched successfully")
      );
  } catch (error) {
    throw new apiError(500, "Server error");
  }
});

export {
  SubscribeAndUnsubscribe,
  getUserTotalSubscribers,
  checkSubscribed,
  getTopCreators,
};
