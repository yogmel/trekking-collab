const express = require("express");
const router = express.Router({ mergeParams: true });
const Comment = require("./../models/comment");
const Campground = require("./../models/campgrounds");
const middleware = require("./../middleware");

// CREATE routes
router.get("/new", middleware.isLoggedIn, (req, res) => {
  const { id } = req.params;
  Campground.findById(id)
    .then((campground) => {
      res.render("comments/new", { campground });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/", middleware.isLoggedIn, async (req, res) => {
  const { comment } = req.body;

  const campground = await Campground.findById(req.params.id);

  Comment.create(comment).then((comment) => {
    comment.author.id = req.user._id;
    comment.author.username = req.user.username;
    comment.save();
    campground.comments.push(comment);
    campground.save();
    console.log(comment);
  });
  req.flash("success", "Successfully added comment");
  res.redirect(`/campgrounds/${req.params.id}`);
});

// EDIT
router.get(
  "/:comment_id/edit",
  middleware.checkCommentOwnership,
  (req, res) => {
    const { id, comment_id } = req.params;
    Campground.findById(id)
    .then(campground => {
      if (campground === null) throw new Error("Campground not found");
      Comment.findById(comment_id)
        .then((comment) => {
          res.render("comments/edit", { id, comment });
        })
        .catch((err) => {
          req.flash("error", err.message);
          res.redirect("back");
        });
    })
    .catch(err => {
      req.flash("error", "Campground not found");
      return res.redirect("back");
    })


  }
);

// UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
  const { id, comment_id } = req.params;
  const { comment } = req.body;
  Comment.findByIdAndUpdate(comment_id, comment)
    .then(() => {
      req.flash("success", "Successfully editted comment");
      res.redirect("/campgrounds/" + id);
    })
    .catch((err) => {
      req.flash("error", err.message);
    });
});

// DELETE
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
  const { id, comment_id } = req.params;
  Comment.findByIdAndDelete(comment_id)
    .then(() => {
      req.flash("success", "Successfully deleted comment");
      res.redirect("/campgrounds/" + id);
    })
    .catch((err) => {
      req.flash("error", err.message);
      res.redirect("back");
    });
});

module.exports = router;
