import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { IdGenerator } from '@stoked-ui/media-selector';
import Stack from '@mui/material/Stack';

const idGen = IdGenerator();

function createCardData(title, name, id, description) {
  return (
    <CardContent>
      <Typography sx={{ fontSize: 14 }} color="text.secondary">
        {name}
      </Typography>
      <Typography sx={{ mb: 1.5 }} variant="h5" component="div">
        {id}
      </Typography>
      <Typography variant="body2">{description}</Typography>
    </CardContent>
  );
}

const cards = [
  createCardData(
    'default id()',
    'idGen.id()',
    idGen.id(),
    'usage of the default id() function',
  ),
  createCardData(
    'named id()',
    `idGen.id('named')`,
    idGen.id('named'),
    'id() with the named argument',
  ),
  createCardData(
    'long id()',
    `idGen.id('long', 12)`,
    idGen.id('long', 12),
    'id() with using the name and length arguments',
  ),
];

export default function IdGeneratorUsage() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <React.Fragment>Loading</React.Fragment>;
  }

  return (
    <Stack spacing={2}>
      {cards.map((card) => {
        return <Card variant="outlined">{card}</Card>;
      })}
    </Stack>
  );
}
