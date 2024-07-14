import * as React from 'react'
import GlobalStyles from '../GlobalStyles'
import Typography from '@mui/material/Typography'

export default function Disconnected() {
  const classes = GlobalStyles()

  return (
    <div className="Disconnected">
      <Typography
        align="center"
        variant="h3"
        className={classes.title}
        color="white"
      >
       💔 PLEASE CONNECT YOUR WALLET💔
      </Typography>
    </div>
  )
}
