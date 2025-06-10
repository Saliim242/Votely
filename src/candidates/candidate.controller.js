import Candidate from "./candidate.model.js";
import Election from "../elections/elections.model.js";
import Vote from "../votes/vote.model.js";

/**
 * @desc    Get all candidates
 * @route   GET /api/candidates
 * @access  Public
 */
export const getAllCandidates = async (req, res, next) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });

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
 * @desc    Get single candidate
 * @route   GET /api/candidates/:id
 * @access  Public
 */
export const getCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate(
      "electionId"
    );

    if (!candidate) {
      return res.status(404).json({
        status: false,
        message: "Candidate not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Candidate retrieved successfully",
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new candidate
 * @route   POST /api/candidates
 * @access  Private/Admin
 */
export const createCandidate = async (req, res, next) => {
  try {
    const { fullName, description, electionId } = req.body;

    // Validate required fields
    if (!fullName || !electionId) {
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

    // Check if election has already started
    // if (new Date() > new Date(election.startDate)) {
    //   return res.status(400).json({
    //     status: false,
    //     message: "Cannot add candidates to an ongoing or ended election",
    //   });
    // }

    // Create candidate
    const candidate = await Candidate.create({
      fullName,
      description,
      electionId,
      image: req.file ? req.file.path : undefined,
    });

    // Add candidate to election
    await Election.findByIdAndUpdate(electionId, {
      $push: { candidates: candidate._id },
    });

    res.status(201).json({
      status: true,
      message: "Candidate created successfully",
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a candidate
 * @route   PUT /api/candidates/:id
 * @access  Private/Admin
 */
export const updateCandidate = async (req, res, next) => {
  try {
    const { fullName, description } = req.body;

    // Find candidate
    let candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        status: false,
        message: "Candidate not found",
      });
    }

    // Check if election has already started
    const election = await Election.findById(candidate.electionId);
    if (new Date() > new Date(election.startDate)) {
      return res.status(400).json({
        status: false,
        message: "Cannot update candidates in an ongoing or ended election",
      });
    }

    // Update candidate
    candidate.fullName = fullName || candidate.fullName;
    candidate.description = description || candidate.description;
    if (req.file) {
      candidate.image = req.file.path;
    }

    await candidate.save();

    res.status(200).json({
      status: true,
      message: "Candidate updated successfully",
      data: candidate,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a candidate
 * @route   DELETE /api/candidates/:id
 * @access  Private/Admin
 */
export const deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        status: false,
        message: "Candidate not found",
      });
    }

    // Check if election has already started
    const election = await Election.findById(candidate.electionId);
    if (new Date() > new Date(election.startDate)) {
      return res.status(400).json({
        status: false,
        message: "Cannot delete candidates from an ongoing or ended election",
      });
    }

    // Check if candidate has votes
    const hasVotes = await Vote.exists({ candidateId: req.params.id });

    if (hasVotes) {
      return res.status(400).json({
        status: false,
        message: "Cannot delete a candidate that has votes",
      });
    }

    // Remove candidate from election
    await Election.findByIdAndUpdate(candidate.electionId, {
      $pull: { candidates: candidate._id },
    });

    // Delete the candidate
    await Candidate.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: true,
      message: "Candidate deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
