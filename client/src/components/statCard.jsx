import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled(Card)(({ theme }) => ({
  margin: '10px',
  textAlign: 'center',
  background: 'linear-gradient(135deg, #6f86d6 0%, #48c6ef 100%)',
  color: '#fff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  borderRadius: '15px',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const TitleTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  },
}));

const ValueTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  [theme.breakpoints.down('sm')]: {
    fontSize: '3rem',
  },
}));

const DescriptionTypography = styled(Typography)(({ theme }) => ({
  opacity: 0.8,
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
  },
}));

const StatCard = ({ title, value, description }) => {
  return (
    <StyledCard>
      <CardContent>
        <TitleTypography variant="h5" component="div">
          {title}
        </TitleTypography>
        <ValueTypography variant="h6">
          {value}
        </ValueTypography>
        <DescriptionTypography variant="body2">
          {description}
        </DescriptionTypography>
      </CardContent>
    </StyledCard>
  );
};

export default StatCard;
