import React from "react";
import { Box, Button, Container, Stack, Typography, Card, CardContent } from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import ScienceIcon from "@mui/icons-material/Science";
import TuneIcon from "@mui/icons-material/Tune";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import Grid from '@mui/material/GridLegacy';
import { useNavigate } from "react-router";

const PromptForgeLandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Headline */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Forge Stunning Images from Pure Imagination
        </Typography>
        <Typography variant="h5" color="text.secondary">
          Text-to-image AI powered by cutting-edge models like FLUX and Stable Diffusion 3.5
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" mt={4}>
          <Button variant="contained" color="primary" size="large" onClick={() => navigate("/generate")}>
            Generate an Image
          </Button>
          <Button variant="outlined" color="primary" size="large" onClick={() => navigate("/models")}>
            Browse Models
          </Button>
        </Stack>
      </Box>

      {/* Features */}
      <Grid container spacing={4} mb={6}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <ScienceIcon fontSize="large" color="primary" />
              <Typography variant="h6" mt={2} gutterBottom>
                Model Selector
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose from FLUX.1, Stable Diffusion, or stylized LoRA models.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <TuneIcon fontSize="large" color="primary" />
              <Typography variant="h6" mt={2} gutterBottom>
                Adjustable Parameters
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tune creativity, resolution, seed, and more.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <ImageIcon fontSize="large" color="primary" />
              <Typography variant="h6" mt={2} gutterBottom>
                Instant Previews
              </Typography>
              <Typography variant="body2" color="text.secondary">
                See results in seconds and download your creations.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3}>
            <CardContent>
              <FlashOnIcon fontSize="large" color="primary" />
              <Typography variant="h6" mt={2} gutterBottom>
                Built for R&D
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Optimized for fast iteration and experimentation.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Example Prompt */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h6" gutterBottom>
          Try a prompt like:
        </Typography>
        <Typography variant="h5" fontStyle="italic" gutterBottom>
          "A dragon reading a book by candlelight in a steampunk library"
        </Typography>
        <Button variant="contained" color="secondary" size="large" onClick={() => navigate("/generate", {state: { prompt: "A dragon reading a book by candlelight in a steampunk library"}})}>
          Open Prompt Editor
        </Button>
      </Box>

      {/* Footer */}
      <Box textAlign="center" pt={1} borderTop={1} borderColor="divider">
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} PromptForge — All rights reserved.
        </Typography>
        <Stack direction="row" spacing={3} justifyContent="center" mt={0}>
          <Button size="small">About</Button>
          <Button size="small">Terms of Use</Button>
          <Button size="small">Privacy Policy</Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default PromptForgeLandingPage;
