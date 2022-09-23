const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');
const AppError = require('../utilities/AppError');

exports.getAllJobs = async (req, res) => {
  const allJobs = await Job.find({ createdBy: req.user._id }).sort('createdAt');
  res.status(StatusCodes.OK).json({
    status: 'success',
    results: allJobs.length,
    allJobs,
  });
};
exports.getJob = async (req, res, next) => {
  console.log(req.params.jobID);
  const job = await Job.findOne({
    _id: req.params.jobID,
    createdBy: req.user._id,
  })
    .populate('createdBy', 'name email -_id')
    .select('-__v');
  if (!job)
    return next(
      new AppError('There is no job with such jobID', StatusCodes.NOT_FOUND)
    );
  res.status(StatusCodes.OK).json(job);
};
exports.createJob = async (req, res) => {
  const { company, position } = req.body;
  // console.log(req.user);
  // console.log(res.locals.user);
  const createdBy = req.user._id;
  const job = await Job.create({ company, position, createdBy });
  res.status(StatusCodes.CREATED).json({
    status: 'success',
    job,
  });
};
const filterObj = (obj, ...allowedFields) => {
  let newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.updateJob = async (req, res, next) => {
  const filteredBody = filterObj(req.body, 'position', 'company');
  const updatedJob = await Job.findOneAndUpdate(
    { createdBy: req.user._id },
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate('createdBy', '-__v -_id')
    .select('-__v -_id');
  if (!filteredBody)
    return next(
      new AppError(
        'You can Only update company and position of that job',
        StatusCodes.NOT_ACCEPTABLE
      )
    );
  console.log(updatedJob);
  console.log(req.body);
  console.log(filteredBody);
  res.status(StatusCodes.OK).json({
    status: 'success',
    updatedJob,
  });
};
exports.deleteJob = async (req, res, next) => {
  const job = await Job.findOneAndDelete({
    _id: req.params.jobID,
    createdBy: req.user._id,
  });
  if (!job) {
    return next(
      new AppError('There is no Job with such ID!!', StatusCodes.NOT_FOUND)
    );
  }
  res.status(StatusCodes.NO_CONTENT).json({
    status: `successfully deleted Job }`,
    data: null,
  });
};
