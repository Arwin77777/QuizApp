import React from 'react';
import '../css/navbar.css';
import { Container, Typography } from '@mui/material';

const FooterComponent = () => {
  return (
    <footer className="footer">
      <Container maxWidth="lg">
        <div className="footer-content">
          <Typography variant="body1">
            © {new Date().getFullYear()} Quizzy. All Rights Reserved.
          </Typography>
          <nav className="footer-nav">
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact Us</a></li>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
            </ul>
          </nav>
          <div className="social-media">
            <a href="https://www.facebook.com/Quizzy" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://www.twitter.com/Quizzy" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://www.instagram.com/Quizzy" target="_blank" rel="noopener noreferrer">Instagram</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default FooterComponent;
