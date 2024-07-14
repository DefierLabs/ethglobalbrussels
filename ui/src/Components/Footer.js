import React from 'react'
import GlobalStyles from './../GlobalStyles'
import clsx from 'clsx'

import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

export default function Footer() {
  const classes = GlobalStyles()

  return (
    <div className="Footer">
      <Card className={classes.noBg} style={{ backgroundColor: 'black' }}>
        <Typography align="center" color="white">
        </Typography>
        <Typography align="center" color="white">
          <IconButton color="inherit" href="/" align="right">
            Opulent 2024 ©{' '} Built for ETHGlobal Brussels
          </IconButton>
        </Typography>
      </Card>
    </div>
  )
}
