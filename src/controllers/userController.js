const userModel = require('../models/userModel');
const validateBody = require('../validation/validation');
const jwt = require("jsonwebtoken");



//---------------------------FIRST API CREATE USER
const userRegistration = async (req, res) => {
    try {
        const myBody = req.body
        const { title, name, phone, email, password, address } = myBody;

        //-----------VALIDATION STARTS
        if (!validateBody.isValidRequestBody(myBody)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful registration" });
        }
        if (!validateBody.isValid(title)) {
            return res.status(400).send({ status: false, message: "Please provide title or title field" });
        }

        if (!validateBody.isValidTitle(title.trim())) {
            res.status(400).send({ status: false, message: "Title should be among  Mr, Mrs, Miss" })
            return
        }
        if (!validateBody.isValid(name)) {
            return res.status(400).send({ status: false, message: "Please provide name or name field" });
        }
        if (!validateBody.alphabetTestOfString(name)) {
            return res.status(400).send({ status: false, message: "You can't use special character or number in name" });
        }
        if (!validateBody.isValid(phone)) {
            return res.status(400).send({ status: false, message: "Please provide phone number or phone field" });
        }
        if (!(/^[6-9]\d{9}$/.test(phone.trim()))) {
            return res.status(400).send({ status: false, message: "Please provide a valid phone number" });
        }
        const duplicatePhone = await userModel.findOne({ phone: phone })
        if (duplicatePhone) {
            return res.status(400).send({ status: false, message: "This phone number already exists with another user" });
        }
        if (!validateBody.isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide Email id or Email field" });
        }
        if (!validateBody.isValidSyntaxOfEmail(email)) {
            return res.status(404).send({ status: false, message: "Please provide a valid Email Id" });
        }
        const isEmailAlreadyUsed = await userModel.findOne({ email: email });
        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: "Email address is already registered,Try different One" })
            return
        }
        if (!validateBody.isValid(password)) {
            return res.status(400).send({ status: false, message: "Please provide password or password field" });;
        }
        if (!(password.trim().length >= 8 && password.trim().length <= 15)) {
            return res.status(400).send({ status: false, message: "Please provide password with minimum 8 and maximum 15 characters" });;
        }
        if (address) {
            if (!validateBody.isString(address.street)) {
                return res.status(400).send({ status: false, message: "If you are providing Address Street key you also have to provide its value" });
            }
        }
        if (address) {
            if (!validateBody.isString(address.city)) {
                return res.status(400).send({ status: false, message: "If you are providing Address City key you also have to provide its value" });
            }
        }
        if (address) {
            if (!validateBody.isString(address.pincode)) {
                return res.status(400).send({ status: false, message: "If you are providing Address Pincode key you also have to provide its value" });
            }
        }

        //------VALIDATION ENDS

        let registration = { title, name, phone, email, password, address }
        const userData = await userModel.create(registration);
        return res.status(201).send({ status: true, message: 'Success', data: userData });
    }
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}


//---------------------------SECOND API USER LOGIN
const userLogin = async (req, res) => {
    try {
        const myBody1 = req.body
        const { email, password } = myBody1
        if (!validateBody.isValidRequestBody(myBody1)) {
            return res.status(400).send({ status: false, message: "Please provide data for successful login" });
        }
        if (!validateBody.isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide email id or email field" });;
        }
        if (!validateBody.isValidSyntaxOfEmail(email)) {
            return res.status(400).send({ status: false, message: "Please provide a valid Email Id" });
        }
        if (!validateBody.isValid(password)) {
            return res.status(400).send({ status: false, message: "Please provide password or password field" });;
        }
        let user = await userModel.findOne({ email: email, password: password });
        if (user) {
            const { _id, name, phone } = user
            let payload = { userId: _id, email: email, phone: phone };

            const generatedToken = jwt.sign(payload, "functionupridersprivatekey", { expiresIn: '180m' });
            res.header('user-login-key', generatedToken);
            return res.status(200).send({
                Message: name + " you have logged in Succesfully",
                userId: user._id,
                token: generatedToken,
            });
        } else {
            return res.status(400).send({ status: false, message: "Oops...Invalid credentials" });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
};


module.exports.userRegistration = userRegistration
module.exports.userLogin = userLogin