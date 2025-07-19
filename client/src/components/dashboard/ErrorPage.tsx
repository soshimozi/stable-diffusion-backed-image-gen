import { Box, Card, CardContent, Typography } from "@mui/material"


export interface ErrorPageProps {
  error: string
}

export const ErrorPage: React.FC<ErrorPageProps> = ({error}) => {
  return (
    <Box sx={{display: "flex", justifyContent: "center", width: "100%", alignItems: "center"}}>
    <Box sx={{minWidth: 800, width: 800}}>
      <Card variant="outlined">
        <CardContent>
          <Box sx={{display: "flex", alignItems: "center", height: "100%", justifyContent: "center"}}>
            <Typography>{error}</Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
    </Box>

  )
}