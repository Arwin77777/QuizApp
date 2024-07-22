import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions, IconButton, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const QuizCard = ({ quiz, onDelete }) => {
  const { quizId, quizName, category, quizImage, type, questions } = quiz;
  const noQuestions = questions.length;
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    setLoading(true);
    axios.delete("http://localhost:3000/quiz", {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: { quizId }
    })
      .then(res => {
        console.log(res.data);
        setLoading(false);
        onDelete(quizId);
        handleClose();
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  };

  return (
    <>
      <Card sx={{ flexBasis: 'calc(25% - 20px)', margin: '5px', boxSizing: 'border-box' }}>
        <CardActionArea>
          <CardMedia
            component="img"
            height="140"
            image={quizImage}
            alt={quizName}
            sx={{ objectFit: 'cover' }}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {quizName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {category}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No of Questions: {noQuestions}
            </Typography>
          </CardContent>
        </CardActionArea>
        <CardActions sx={{ justifyContent: 'space-between' }}>
          {type === 'edit' ? (
            <>
              <Link to={`/quiz/${quizId}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                <Button size="small" color="primary" startIcon={<EditIcon />}>
                  Edit Quiz
                </Button>
              </Link>
              <IconButton
                color="error"
                onClick={handleClickOpen}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : <DeleteIcon />}
              </IconButton>
            </>
          ) : (
            <Link
              to="/quizIntro"
              state={{ quizId, quizName, category, quizImage, noQuestions }}
              style={{ textDecoration: 'none' }}
            >
              <Button size="small" color="primary">
                Take Quiz
              </Button>
            </Link>
          )}
        </CardActions>
      </Card>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the quiz "{quizName}"?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuizCard;
