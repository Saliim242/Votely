import Election from "./elections.model.js";
import Candidate from "../candidates/candidate.model.js";
import Vote from "../votes/vote.model.js";

/**
 * @desc    Get all elections
 * @route   GET /api/elections
 * @access  Public
 */
export const getAllElections = async (req, res, next) => {
  try {
    const elections = await Election.find()
      .sort({ createdAt: -1 })
      .populate("candidates");

    res.status(200).json({
      status: true,
      message: "Elections retrieved successfully",
      data: elections,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single election
 * @route   GET /api/elections/:id
 * @access  Public
 */
export const getElection = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id).populate(
      "candidates"
    );

    if (!election) {
      return res.status(404).json({
        status: false,
        message: "Election not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Election retrieved successfully",
      data: election,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new election
 * @route   POST /api/elections
 * @access  Private/Admin
 */
export const createElection = async (req, res, next) => {
  try {
    const { title, description, image, startDate, endDate } = req.body;

    // Validate required fields
    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        status: false,
        message: "Please provide all required fields",
      });
    }

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        status: false,
        message: "End date must be after start date",
      });
    }

    // Create election
    const election = await Election.create({
      title,
      description,
      image,
      startDate,
      endDate,
      createdBy: req.user.id,
    });

    res.status(201).json({
      status: true,
      message: "Election created successfully",
      data: election,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an election
 * @route   PUT /api/elections/:id
 * @access  Private/Admin or Creator
 */
export const updateElection = async (req, res, next) => {
  try {
    const { title, description, image, startDate, endDate, status } = req.body;

    // Find election
    let election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        status: false,
        message: "Election not found",
      });
    }

    // Check if election has already started and trying to change dates
    if (
      election.status !== "upcoming" &&
      (startDate || endDate) &&
      new Date() > new Date(election.startDate)
    ) {
      return res.status(400).json({
        status: false,
        message: "Cannot change dates for an ongoing or ended election",
      });
    }

    // Validate dates if provided
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        status: false,
        message: "End date must be after start date",
      });
    }

    // Update election
    election.title = title || election.title;
    election.description = description || election.description;
    election.image = image || election.image;
    election.startDate = startDate || election.startDate;
    election.endDate = endDate || election.endDate;

    // Only allow status update if valid transition
    if (status) {
      // Validate status transitions
      if (
        (election.status === "upcoming" && status === "ongoing") ||
        (election.status === "ongoing" && status === "ended") ||
        req.user.role === "Admin" // Admin can change to any status
      ) {
        election.status = status;
      } else {
        return res.status(400).json({
          status: false,
          message: "Invalid status transition",
        });
      }
    }

    const updatedElection = await Election.findByIdAndUpdate(
      req.params.id,
      election,
      {
        new: true,
      }
    );

    // await election.save();

    res.status(200).json({
      status: true,
      message: "Election updated successfully",
      data: updatedElection,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an election
 * @route   DELETE /api/elections/:id
 * @access  Private/Admin or Creator
 */
export const deleteElection = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        status: false,
        message: "Election not found",
      });
    }

    // Check if election has votes
    const hasVotes = await Vote.exists({ electionId: req.params.id });

    if (hasVotes) {
      return res.status(400).json({
        status: false,
        message: "Cannot delete an election that has votes",
      });
    }

    // Delete all candidates associated with this election
    await Candidate.deleteMany({ electionId: req.params.id });

    // Delete the election
    await Election.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: true,
      message: "Election deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all candidates for an election
 * @route   GET /api/elections/:id/candidates
 * @access  Public
 */
export const getElectionCandidates = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        status: false,
        message: "Election not found",
      });
    }

    const candidates = await Candidate.find({ electionId: req.params.id });

    res.status(200).json({
      status: true,
      message: "Candidates retrieved successfully",
      data: candidates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Vote in an election
 * @route   POST /api/elections/:id/vote
 * @access  Private
 */
export const voteInElection = async (req, res, next) => {
  try {
    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({
        status: false,
        message: "Please provide a candidate ID",
      });
    }

    // Check if election exists
    const election = await Election.findById(req.params.id);

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
      electionId: req.params.id,
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
      electionId: req.params.id,
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
      electionId: req.params.id,
      candidateId,
    });

    // Increment candidate's vote count
    candidate.votesCount += 1;
    await candidate.save();

    // Add election to user's voted elections
    await User.findByIdAndUpdate(req.user.id, {
      $push: { votedElections: req.params.id },
    });

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
 * @desc    Get election results
 * @route   GET /api/elections/:id/results
 * @access  Public
 */
export const getElectionResults = async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        status: false,
        message: "Election not found",
      });
    }

    // Only show results if election has ended or user is admin
    if (
      election.status !== "ended" &&
      (!req.user || req.user.role !== "Admin")
    ) {
      return res.status(403).json({
        status: false,
        message: "Results are only available after the election has ended",
      });
    }

    const candidates = await Candidate.find({ electionId: req.params.id }).sort(
      {
        votesCount: -1,
      }
    );

    const totalVotes = await Vote.countDocuments({ electionId: req.params.id });

    res.status(200).json({
      status: true,
      message: "Election results retrieved successfully",
      data: {
        election,
        candidates,
        totalVotes,
      },
    });
  } catch (error) {
    next(error);
  }
};
