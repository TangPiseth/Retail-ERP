const success = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

const error = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    data: null,
    message,
  };
  if (errors) response.errors = errors;
  return res.status(statusCode).json(response);
};

const paginated = (res, data, { page, limit, total }) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      limit,
    },
    message: 'Success',
  });
};

module.exports = { success, error, paginated };
