const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer")

const Threads = require("../models/threads");

const authenticate = require('../authenticate')

const threadRouter = express.Router();

threadRouter.use(bodyParser.json());




var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },

    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

// const imageFileFilter = (req, file ,cb) => {
//     if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
//         return cb(new Error("You can only upload image files!"), false);
//     }
//     cb(null, true);
// };

// const upload = multer({storage: storage, 
//     fileFilter: imageFileFilter});

const upload = multer({storage: storage})





//LIST ALL THREADS
threadRouter.route('/')
.get(authenticate.verifyUser, (req,res,next) => {
    Threads.find({})
    .populate("author")
    .populate("comments.author")
    .then((thread)=>{
        res.render("threads", {threads: thread, user_id: req.user_id});
        //res.render("threads", {threads: thread});
        res.statusCode=200;
        //res.setHeader("Content-Type", "application/json");
    }, (err)=>next(err))
    .catch((err)=>next(err));
})

// CREATE THREAD
threadRouter.route('/create')
.get(authenticate.verifyUser, (req, res, next) => {
    res.render("new-thread");
})
.post(authenticate.verifyUser, upload.single("image"), (req, res, next) => {
    req.body.author = req.user._id
    req.body.image = req.file.originalname
    Threads.create(req.body)
    .then((thread)=>{
        res.redirect("/threads")
        res.statusCode=200;
    }, (err)=>next(err))
    .catch((err)=>next(err));
})

// VIEW WHOLE THREAD AND COMMENTS
threadRouter.route("/view/:threadId")
.get(authenticate.verifyUser, (req, res, next)=>{
    Threads.findById(req.params.threadId)
    .populate("comments.author")
        .then((thread)=>{
            res.render("view-comment", {threads: thread, ids: req.user._id});
            res.statusCode=200;
        }, (err)=>next(err))
        .catch((err)=>next(err));
 })

 .post(authenticate.verifyUser, (req, res, next) => {
    Threads.findById(req.params.threadId)
    .then((thread) => {
        if(thread != null) {
            req.body.author = req.user._id
            thread.comments.push(req.body)
            thread.save()
            .then((thread) => {
                Threads.findById(thread._id)
                    .populate("comments.author")
                    .then((thread) => {
                        res.redirect("/threads")
                        res.statusCode = 200
                    })
            }, (err) => { next(err) })
        }
        else {
            err = new Error('Thread ' + req.params.threadId + ' not found')
            err.status = 404
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})

// EDIT THREAD
threadRouter.route('/edit/:threadId')
.get(authenticate.verifyUser, (req, res, next) => {
    Threads.findById(req.params.threadId)
    .then((thread) => {
        res.render("edit-thread", {threads: thread, ids: req.user._id});
        res.statusCode = 200;
    }, (err) => next(err))
    .catch((err)=> next(err))
})
.post(authenticate.verifyUser, (req, res, next)=>{
    Threads.findByIdAndUpdate(req.params.threadId, {
        $set: req.body
    },{new: true})
    .then((thread)=>{
        res.redirect("/threads")
        res.statusCode=200;
     }, (err)=>next(err))
    .catch((err)=>next(err));
});


//DELETE THREAD
threadRouter.route("/delete/:threadId")
.get(authenticate.verifyUser, (req, res, next) => {
    Threads.findById(req.params.threadId)
    .then((thread) => {
        res.render("delete-thread", {threads: thread, ids: req.user._id});
        res.statusCode = 200;
    }, (err) => next(err))
    .catch((err)=> next(err))
})
.post(authenticate.verifyUser, (req, res, next) => {
    Threads.findByIdAndRemove(req.params.threadId)
    .then((resp)=>{
        res.redirect("/threads");
        res.statusCode=200;
    }, (err)=>next(err))
    .catch((err)=>next(err));
})

// EDIT COMMENT
threadRouter.route('/:threadId/comments/edit/:commentId')
.get((req, res, next) => {
    Threads.findById(req.params.threadId)
    .populate("comments.author")
    .then((thread) => {
        if(thread != null && thread.comments.id(req.params.commentId) != null) {
            res.render("edit-comment", {threads: thread})
            res.statusCode = 200
        }
        else if(thread == null){
            err = new Error('Thread ' + req.params.threadId + ' not found')
            err.status = 404
            return next(err)
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found')
            err.status = 404
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(authenticate.verifyUser, (req, res, next) => {
    Threads.findById(req.params.threadId)
    .then((thread) => {
        if(thread != null && thread.comments.id(req.params.commentId) != null) {
            // if(req.body.rating) {
            //     thread.comments.id(req.params.commentId).rating = req.body.rating
            // }
            if(req.body.comment) {
                thread.comments.id(req.params.commentId).comment = req.body.comment
            }
            thread.save()
            .then((thread) => {
                Threads.findById(thread._id)
                .populate("comments.author")
                .then((thread) => {
                    res.redirect("/threads")
                    res.statusCode = 200
                })
            }, (err) => { next(err) })
        }
        else if(thread == null){
            err = new Error('Thread ' + req.params.threadId + ' not found')
            err.status = 404
            return next(err)
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found')
            err.status = 404
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})


// DELETE COMMENT
threadRouter.route('/:threadId/comments/delete/:commentId')
.get(authenticate.verifyUser, (req, res, next) => {
    Threads.findById(req.params.threadId)
    .then((thread) => {
        if(thread != null && thread.comments.id(req.params.commentId) != null) {
            thread.comments.id(req.params.commentId).remove()
            thread.save()
            .then((thread) => {
                Threads.findById(thread._id)
                .populate("comments.author")
                .then((thread) => {
                    res.redirect("/threads")
                    res.statusCode = 200
                })
            }, (err) => { next(err) })
        }
        else if(thread == null){
            err = new Error('Thread ' + req.params.threadId + ' not found')
            err.status = 404
            return next(err)
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found')
            err.status = 404
            return next(err)
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})

module.exports =threadRouter;
