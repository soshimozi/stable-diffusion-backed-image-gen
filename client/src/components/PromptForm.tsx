import { Box, Button, CircularProgress, Fade, IconButton, Modal, TextField, Typography } from "@mui/material";
import { useState } from "react";

export interface PromptFormProps {
  defaultPrompt: string;
  generating: boolean;
  elapsedTime: number;
  onGenerate: (prompt: string) => void;
}

export const PromptForm: React.FC<PromptFormProps> = ({generating, onGenerate, defaultPrompt, elapsedTime}) => {
  const [prompt, setPrompt] = useState<string>(defaultPrompt);

function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

  return (
    <Box sx={{display:"flex", flexDirection: "column"}}>
      <Box><Typography sx={{fontWeight: 500, fontSize: "16px"}}>Prompt</Typography></Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            width: "100%",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <TextField
              rows={4}
              value={prompt}
              placeholder="Enter an image prompt."
              multiline
              fullWidth
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setPrompt(event.target.value);
              }}
            />
          </Box>

          <Box>
            <Button
              variant="contained"
              onClick={() => onGenerate(prompt)}
              disabled={generating}
              startIcon={generating ? <CircularProgress size={20} /> : null}
            >
              {generating ? `Generating (${formatTime(elapsedTime)})...` : "Submit"}
            </Button>
          </Box>
        </Box>  
      </Box>  
  )
}