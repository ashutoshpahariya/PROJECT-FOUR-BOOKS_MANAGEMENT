const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const reviewController = require('../controllers/reviewController')
const myMiddleware = require('../middleWares/middleWare')

//---------------------------FIRST API CREATE USER
router.post('/register', userController.userRegistration)

//---------------------------SECOND API USER LOGIN
router.post('/login', userController.userLogin)

//---------------------------THIRD API CREATE BOOKS
router.post('/books', myMiddleware.getUserDetails, bookController.createBook)

//---------------------------FOURTH API GET BOOKS BY QUERY
router.get('/books', myMiddleware.getUserDetails, bookController.getQueryBooks)

//---------------------------FIFTH API GET BOOKS BY PARAMS
router.get('/books/:bookId', myMiddleware.getUserDetails, bookController.getParamsBook)

//---------------------------SIXTH API UPDATE BOOKS BY PARAMS
router.put('/books/:bookId', myMiddleware.getUserDetails, bookController.updateBookById)

//---------------------------SEVEN API DELETE BOOKS BY PARAMS
router.delete('/books/:bookId', myMiddleware.getUserDetails, bookController.deleteBookById)

//---------------------------EIGHT API CREATE REVIEWS BY BOOKS ID IN PARAMS
router.post('/books/:bookId/review', reviewController.createReview)

//---------------------------NINTH API UPDATE REVIEWS BY BOOKS ID IN PARAMS
router.put('/books/:bookId/review/:reviewId', reviewController.updateReview)

//---------------------------TENTH API DELETE REVIEWS BY BOOKS ID AND REVIEWS IN PARAMS
router.delete('/books/:bookId/review/:reviewId', reviewController.deleteReview)




//---------------------------selfTest----------------------------//
router.get('/testCount', bookController.testBoookCount)
module.exports = router;