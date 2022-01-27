const bookModel = require('../models/bookModel');
const userModel = require('../models/userModel');
const reviewModel = require('../models/reviewModel');
const validateBody = require('../validation/validation');
const ObjectId = require('mongoose').Types.ObjectId;


//---------------------------THIRD API CREATE BOOKS
const createBook = async (req, res) => {
    try {
        const myBody = req.body
        const { title, excerpt, userId, ISBN, category, subcategory, reviews } = myBody;
        if (!validateBody.isValidRequestBody(myBody)) {
            return res.status(400).send({ status: false, message: "Please provide body for successful creation" });
        }
        if (!validateBody.isValid(title)) {
            return res.status(400).send({ status: false, message: "Please provide title or title field" });
        }
        const duplicateTitle = await bookModel.findOne({ title: title });
        if (duplicateTitle) {
            return res.status(400).send({ status: false, message: "This book title already exists with another book" });
        }
        if (!validateBody.isValid(excerpt)) {
            return res.status(400).send({ status: false, message: "Please provide excerpt or excerpt field" });
        }
        if (!validateBody.isValid(userId)) {
            return res.status(400).send({ status: false, message: "Please provide userId or userId field" });
        }
        let checkOBJ = ObjectId.isValid(userId);
        if (!checkOBJ) {
            return res.status(400).send({ status: false, message: "Please Provide a valid userId in body params" });;
        }
        if (!(userId == req.userId)) {
            return res.status(400).send({ status: false, message: "Your are not authorize to create this book with this userId" });;
        }
        if (!validateBody.isValid(ISBN)) {
            return res.status(400).send({ status: false, message: "Please provide ISBN  or ISBN field" });
        }
        const duplicateISBN = await bookModel.findOne({ ISBN: ISBN });
        if (duplicateISBN) {
            return res.status(400).send({ status: false, message: "This book ISBN already exists with another book" });
        }

        if (!validateBody.isValid(category)) {
            return res.status(400).send({ status: false, message: "Please provide category  or category field" });
        }
        if (!validateBody.isValid(subcategory)) {
            return res.status(400).send({ status: false, message: "Please provide subcategory or subcategory field" });
        }
        let idFind = await userModel.findById(userId);
        if (!idFind) {
            return res.status(400).send({ message: "This userId doesn't exist" });
        }
        else {
            let releasedAt = new Date()
            let bookCreated = { title, excerpt, userId, ISBN, category, subcategory, releasedAt, reviews }
            let savedData = await bookModel.create(bookCreated)
            return res.status(201).send({ status: true, message: 'Success', data: savedData });
        }
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}


//---------------------------FOURTH API GET BOOKS BY QUERY
const getQueryBooks = async (req, res) => {
    try {
        let myQuery = req.query;
        const { userId, category, subcategory } = myQuery
        if (userId || category || subcategory) {

            if (userId) {
                let checkOBJ1 = ObjectId.isValid(userId);
                if (!checkOBJ1) {
                    return res.status(400).send({ status: false, message: "Please Provide a valid userId in query params" });;
                }
            }
            myQuery.isDeleted = false;
            let bookFound = await bookModel.find(myQuery).select({ ISBN: 0, subcategory: 0, isDeleted: 0, deletedAt: 0, createdAt: 0, updatedAt: 0, __v: 0 });
            if (!(bookFound.length > 0)) {
                return res.status(404).send({ status: false, message: "Sorry, there is no such book found" });
            }
            let sortedBooks = bookFound.sort((a, b) => a.title - b.title);
            let counting = sortedBooks.length
            return res.status(200).send({ status: true, Total: counting, message: 'Books list', data: sortedBooks });

        } else {
            let Allbook = await bookModel.find().select({ ISBN: 0, subcategory: 0, isDeleted: 0, deletedAt: 0, createdAt: 0, updatedAt: 0, __v: 0 });

            return res.status(200).send({ status: true, message: "ALL BOOKS", data: Allbook });
        }
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}



//---------------------------FIFTH API GET BOOKS BY PARAMS
const getParamsBook = async (req, res) => {
    try {
        let paramsId = req.params.bookId
        let checkOBJ4 = ObjectId.isValid(paramsId);
        if (!checkOBJ4) {
            return res.status(400).send({ status: false, message: "Please Provide a valid bookId in path params" });;
        }

        let checkParams = await bookModel.findOne({ _id: paramsId, isDeleted: false }).select({ ISBN: 0 });
        //-----------DESTRUCTURING
        if (!checkParams) {
            return res.status(404).send({ status: false, msg: "There is no book exist with this id or its deleted" });
        }
      const  { _id, title, excerpt, userId, category, subcategory, reviews, isDeleted, deletedAt, releasedAt, createdAt, updatedAt } = checkParams
        const reviewData = await reviewModel.find({ bookId: paramsId, isDeleted: false }).select({ bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1 });

        const newData = { _id, title, excerpt, userId, category, subcategory, reviews, isDeleted, deletedAt, releasedAt, createdAt, updatedAt, reviewData }

        return res.status(200).send({ status: true, message: 'Books list', data: newData });
    }

    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, msg: err.message });
    }
}



//---------------------------SIXTH API UPDATE BOOKS BY PARAMS
const updateBookById = async (req, res) => {
    try {
        let bookId = req.params.bookId;
        let checkOBJ3 = ObjectId.isValid(bookId);
        if (!checkOBJ3) {
            return res.status(400).send({ status: false, message: "Please Provide a valid bookId in path params" });;
        }
        let updateBody = req.body
        if (!validateBody.isValidRequestBody(updateBody)) {
            return res.status(400).send({ status: false, message: "Please provide data to proceed your update request" });
        }
        const { title, excerpt, releasedAt, ISBN } = updateBody
        let data = await bookModel.findOne({ _id: bookId ,isDeleted:false});
        if (!data) {
            return res.status(404).send({ status: false, message: "This bookId does not exist or its deleted" });
        }
        if (!validateBody.isString(title)) {
            return res.status(400).send({ status: false, message: "If you are providing title key you also have to provide its value" });
        }
        const duplicateTitle = await bookModel.findOne({ title: title });
        if (duplicateTitle) {
            return res.status(400).send({ status: false, message: "This book title is already exists with another book" });
        }
        if (!validateBody.isString(excerpt)) {
            return res.status(400).send({ status: false, message: "If you are providing excerpt key you also have to provide its value" });
        }
        if (!validateBody.isString(ISBN)) {
            return res.status(400).send({ status: false, message: "If you are providing ISBN key you also have to provide its value" });
        }
        const duplicateISBN = await bookModel.findOne({ ISBN: ISBN })
        if (duplicateISBN) {
            return res.status(400).send({ status: false, message: "This ISBN number already exists with another book" });
        }
        if (req.userId == data.userId) {
            if (title) {data.title = title;}
            if (excerpt) {data.excerpt = excerpt;}
            if (releasedAt) {data.releasedAt = new Date()}
            if (ISBN) {data.ISBN = ISBN;}
            data.save();
            return res.status(200).send({ status: true, message: 'Success', data: data });
        } else {
            return res.status(400).send({ status: false, message: "Sorry, You are not authorize to update details of this blook" });
        }
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};


//---------------------------SEVEN API DELETE BOOKS BY PARAMS
const deleteBookById = async (req, res) => {
    try {
        let id1 = req.params.bookId;
        let checkOBJ2 = ObjectId.isValid(id1);
        if (!checkOBJ2) {
            return res.status(400).send({ status: false, message: "Please Provide a valid bookId in path params" });;
        }
        let data = await bookModel.findOne({ _id: id1 , isDeleted:false });
        if (!data) {
            return res.status(404).send({ status: false, message: "This Book id does not exits or its deleted" });
        }
        if (req.userId == data.userId) {
            data.isDeleted = true;
            data.deletedAt = Date();
            data.save();
            return res.status(200).send({ status: true, message: 'Success', data: data });
        } else {
            return res.status(400).send({ status: false, message: " You are not authorize to delete this blook" });
        }
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};



module.exports.createBook = createBook;
module.exports.getQueryBooks = getQueryBooks;
module.exports.getParamsBook = getParamsBook;
module.exports.updateBookById = updateBookById;
module.exports.deleteBookById = deleteBookById;


//---------------------------selfTest----------------------------//
const testBoookCount = async (req, res) => {
    try {
        let checkId = req.body.userId
        let totalCount = await bookModel.find({ userId: checkId }).count()
        let totalBook = await bookModel.find({ userId: checkId })
        if (totalCount) {
            res.send({ message: "success", data: { total_Boooks: totalCount, books_Are: totalBook } })
        } else {
            res.send({ message: "no boook find" })
        }
    }
    catch (err) {
        return res.status(500).send({ message: err.message });
    }
}
module.exports.testBoookCount = testBoookCount;