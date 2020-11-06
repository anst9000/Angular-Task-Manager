const express = require("express");
const router = express.Router();

// Load in the mongoose models
const { List, Task } = require("../models");

// Load in middleware
const { authenticate, verifySession } = require("../middleware");

/**
 * ====================================
 * ROUTES FOR LISTS
 * ====================================
 */
// @route   GET /lists
// @desc    Get all lists
// @access  Public
router.get("/", authenticate, (req, res) => {
  // Return an array of all the lists in the database that belong to the authenticated user
  List.find({
    _userId: req.user_id,
  }).then((lists) => {
    res.send(lists);
  });
});

// @route   POST /lists
// @desc    Create new list
// @access  Public
router.post("/", authenticate, (req, res) => {
  // We want to create a new list and return the new list document back to the user
  // The list information fields will be passed in via the the req body
  let title = req.body.title;

  let newList = new List({
    title,
    _userId: req.user_id,
  });

  newList.save().then((listDoc) => {
    // The full list document is returned
    res.send(listDoc);
  });
});

// @route   PATCH /lists/id
// @desc    Update list
// @access  Public
router.patch("/:id", authenticate, (req, res) => {
  // We want to update the specified list with new values
  List.findByIdAndUpdate(
    {
      _id: req.params.id,
      _userId: req.user_id,
    },
    {
      $set: req.body,
    }
  ).then(() => {
    res.send({ message: "updated successfully" });
  });
});

// @route   DELETE /lists/id
// @desc    Delete list
// @access  Public
router.delete("/:id", authenticate, (req, res) => {
  // Delete specified list
  List.findByIdAndRemove({
    _id: req.params.id,
    _userId: req.user_id,
  }).then((removedListDoc) => {
    res.send(removedListDoc);

    // Delete all tasks that are in the deleted list
    deleteTasksFromList(removedListDoc._id);
  });
});
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

/**
 * ====================================
 * ROUTES FOR TASKS
 * ====================================
 */
// @route   GET /lists/:listId/tasks
// @desc    Get all tasks in specific list
// @access  Public
router.get("/:listId/tasks", authenticate, (req, res) => {
  // Return all tasks that belong to a specific list in the database
  Task.find({ _listId: req.params.listId }).then((tasks) => {
    res.send(tasks);
  });
});

// @route   GET /lists/:listId/tasks/:taskId
// @desc    Get specific task in specific list
// @access  Public
router.get("/:listId/tasks/:taskId", authenticate, (req, res) => {
  // Return specific task that belong to a specific list in the database
  Task.findOne({
    _id: req.params.taskId,
    _listId: req.params.listId,
  }).then((task) => {
    res.send(task);
  });
});

// @route   POST /lists/:listId/tasks
// @desc    Create new task
// @access  Public
router.post("/:listId/tasks", authenticate, (req, res) => {
  // We want to create a new task in a list specified by listId
  List.findOne({
    _id: req.params.listId,
    _userId: req.user_id,
  })
    .then((list) => {
      if (list) {
        // List object is valid and User is allowed to create new tasks
        return true;
      } else {
        // User is undefined
        return false;
      }
    })
    .then((canCreateTask) => {
      if (canCreateTask) {
        let newTask = new Task({
          title: req.body.title,
          _listId: req.params.listId,
        });

        newTask.save().then((newTaskDoc) => {
          // The full list document is returned
          res.send(newTaskDoc);
        });
      } else {
        res.sendStatus(404);
      }
    })
    .catch((err) => console.log("err is", err));
});

// @route   PATCH /lists/:listId/tasks/:taskId
// @desc    Update task in specific list
// @access  Public
router.patch("/:listId/tasks/:taskId", authenticate, (req, res) => {
  // We want to update an existing task from the specified list with new values
  List.findOne({
    _id: req.params.listId,
    _userId: req.user_id,
  })
    .then((list) => {
      if (list) {
        // List object is valid and User is allowed update tasks in this list
        return true;
      } else {
        // User is undefined
        return false;
      }
    })
    .then((canCreateTask) => {
      if (canCreateTask) {
        // Current user can update task
        Task.findByIdAndUpdate(
          { _id: req.params.taskId, _listId: req.params.listId },
          {
            $set: req.body,
          }
        ).then(() => {
          res.send({ message: "Updated successfully" });
        });
      } else {
        res.sendStatus(404);
      }
    });
});

// @route   DELETE /lists/:listId/tasks/:taskId
// @desc    Delete task in specific list
// @access  Public
router.delete("/:listId/tasks/:taskId", authenticate, (req, res) => {
  // Delete specified task from specific list
  List.findOne({
    _id: req.params.listId,
    _userId: req.user_id,
  })
    .then((list) => {
      if (list) {
        // List object is valid and User is allowed update tasks in this list
        return true;
      } else {
        // User is undefined
        return false;
      }
    })
    .then((canDeleteTask) => {
      if (canDeleteTask) {
        Task.findByIdAndRemove({
          _id: req.params.taskId,
          _listId: req.params.listId,
        }).then((removedTaskDoc) => {
          res.send(removedTaskDoc);
        });
      } else {
        res.sendStatus(404);
      }
    });
});
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

// HELPER METHODS
let deleteTasksFromList = (_listId) => {
  Task.deleteMany({
    _listId,
  }).then(() => {
    console.log(`Tasks from ${_listId} were deleted`);
  });
};

module.exports = router;
