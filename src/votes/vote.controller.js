import Vote from "./vote.model.js";
import Election from "../elections/elections.model.js";
import Candidate from "../candidates/candidate.model.js";
import User from "../users/user.model.js";

/**
 * @desc    Get all votes (admin only)
 * @route   GET /api/votes
 * @access  Private/Admin
 */
export const getAllVotes = async (req, res, next) => {
  try {
    const votes = await Vote.find()
      .populate("userId", "fullName email")
      .populate("electionId", "title")
      .populate("candidateId", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      message: "Votes retrieved successfully",
      data: votes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's votes
 * @route   GET /api/votes/me
 * @access  Private
 */
export const getUserVotes = async (req, res, next) => {
  try {
    const votes = await Vote.find({ userId: req.user.id })
      .populate("electionId", "title")
      .populate("candidateId", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: true,
      message: "User votes retrieved successfully",
      data: votes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single vote
 * @route   GET /api/votes/:id
 * @access  Private/Admin or Owner
 */
export const getVote = async (req, res, next) => {
  try {
    const vote = await Vote.findById(req.params.id)
      .populate("userId", "fullName email")
      .populate("electionId", "title")
      .populate("candidateId", "fullName");

    if (!vote) {
      return res.status(404).json({
        status: false,
        message: "Vote not found",
      });
    }

    // Check if user is admin or owner of the vote
    if (
      req.user.role !== "Admin" &&
      vote.userId._id.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        status: false,
        message: "Not authorized to access this vote",
      });
    }

    res.status(200).json({
      status: true,
      message: "Vote retrieved successfully",
      data: vote,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cast a vote
 * @route   POST /api/votes
 * @access  Private
 */
export const castVote = async (req, res, next) => {
  try {
    const { electionId, candidateId } = req.body;

    if (!electionId || !candidateId) {
      return res.status(400).json({
        status: false,
        message: "Please provide all required fields",
      });
    }

    // Check if election exists
    const election = await Election.findById(electionId);

    if (!election) {
      return res.status(404).json({
        status: false,
        message: "Election not found",
      });
    }

    // Check if election is ongoing
    const now = new Date();
    if (
      now < new Date(election.startDate) ||
      now > new Date(election.endDate)
    ) {
      return res.status(400).json({
        status: false,
        message: "Election is not currently active",
      });
    }

    // Check if candidate exists and belongs to this election
    const candidate = await Candidate.findOne({
      _id: candidateId,
      electionId,
    });

    if (!candidate) {
      return res.status(404).json({
        status: false,
        message: "Candidate not found in this election",
      });
    }

    // Check if user has already voted in this election
    const existingVote = await Vote.findOne({
      userId: req.user.id,
      electionId,
    });

    if (existingVote) {
      return res.status(400).json({
        status: false,
        message: "You have already voted in this election",
      });
    }

    // Create vote
    const vote = await Vote.create({
      userId: req.user.id,
      electionId,
      candidateId,
    });

    // Increment candidate's vote count
    candidate.votesCount += 1;
    await candidate.save();

    // Add election to user's voted elections
    await User.findByIdAndUpdate(req.user.id, {
      $push: { votedElections: electionId },
    });

    // Emit real-time update event
    if (req.app.get("io")) {
      const io = req.app.get("io");

      // Emit to election room
      io.to(`election-${electionId}`).emit("vote-cast", {
        electionId,
        candidateId,
        votesCount: candidate.votesCount,
      });

      // Emit to admin room for monitoring
      io.to("admin-room").emit("new-vote", {
        vote: {
          id: vote._id,
          electionId,
          candidateId,
          userId: req.user.id,
          votedAt: vote.votedAt,
        },
      });
    }

    res.status(201).json({
      status: true,
      message: "Vote cast successfully",
      data: vote,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a vote (admin only)
 * @route   DELETE /api/votes/:id
 * @access  Private/Admin
 */
export const deleteVote = async (req, res, next) => {
  try {
    const vote = await Vote.findById(req.params.id);

    if (!vote) {
      return res.status(404).json({
        status: false,
        message: "Vote not found",
      });
    }

    // Get candidate to decrement vote count
    const candidate = await Candidate.findById(vote.candidateId);
    if (candidate) {
      candidate.votesCount = Math.max(0, candidate.votesCount - 1);
      await candidate.save();
    }

    // Remove election from user's voted elections
    await User.findByIdAndUpdate(vote.userId, {
      $pull: { votedElections: vote.electionId },
    });

    // Delete the vote
    await Vote.findByIdAndDelete(req.params.id);

    // Emit real-time update event
    if (req.app.get("io") && candidate) {
      const io = req.app.get("io");

      // Emit to election room
      io.to(`election-${vote.electionId}`).emit("vote-deleted", {
        electionId: vote.electionId,
        candidateId: vote.candidateId,
        votesCount: candidate.votesCount,
      });

      // Emit to admin room
      io.to("admin-room").emit("vote-deleted", {
        voteId: req.params.id,
        electionId: vote.electionId,
        candidateId: vote.candidateId,
      });
    }

    res.status(200).json({
      status: true,
      message: "Vote deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
