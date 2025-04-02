import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { namedId } from '@stoked-ui/common';
import Stack from '@mui/material/Stack';


function createCardData(
  title: string,
  name: string,
  id: string,
  description: string,
) {
  return (
    <CardContent>
      <Typography sx={{ fontSize: 14 }}  color="text.secondary">
        {name}
      </Typography>
      <Typography  sx={{ mb: 1.5 }} variant="h5" component="div">
        {id}
      </Typography>
      <Typography variant="body2">
        {description}
      </Typography>
    </CardContent>
  );
}

const cards = [
  createCardData('default namedId', 'namedId()', namedId(), 'usage of the default id() function'),
  createCardData('custom name namedId', `namedId({id: 'named'})`, namedId({id: 'named'}), 'id() with the named argument'),
  createCardData('custom length namedId', `namedId({id: 'long', length: 12})`, namedId({id: 'long', length: 12}), 'id() with using the name and length arguments'),
];

export default function NamedId() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <React.Fragment>Loading</React.Fragment>;
  }

  return (
    <Stack spacing={2}>
      {cards.map(card => {
        return (
          <Card variant="outlined">{card}</Card>
        );
      })}
    </Stack>
  );
}

