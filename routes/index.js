import express from 'express';
import controller from '../controllers/controller.js';

const router = express.Router();
export default router;

router.use('/', controller);

// catch 404 and forward to error handler
/* router.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})

// error handler
router.use((err, req, res, next) => {
  // render the error page
  res.status(err.status || 500)
  res.render('error', { status: err.status, message: err.message })
}) */