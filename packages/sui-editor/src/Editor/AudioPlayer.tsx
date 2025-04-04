/**
 * AudioPlayer component that plays an audio file.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.file - The audio file object with URL, type, and image.
 * @returns {JSX.Element} The rendered AudioPlayer component.
 */
export default function AudioPlayer({ file }) {
  /**
   * The duration of the audio in seconds.
   *
   * @type {number}
   */
  const duration = 200;

  /**
   * The current position of the audio playback in seconds.
   *
   * @type {number}
   */
  const [position, setPosition] = React.useState(0);

  /**
   * Handles the change event for the slider component.
   *
   * @param {Object} event - The change event object.
   * @param {number} event.value - The new value of the slider.
   */
  const handleChange = (event) => {
    setPosition(event.target.value as number);
  };

  /**
   * Handles the click event for the play/pause button.
   *
   * @param {Event} event - The click event object.
   */
  const handlePlayPause = () => {
    // Set the paused state
    const isPaused = !paused;
    setPaused(isPaused);
  };

  /**
   * The audio source for the Plyr component.
   *
   * @type {Object}
   */
  const audioSource = {
    type: 'audio/mpeg',
    src: file.url,
  };

  return (
    <Box>
      {/* Audio controls */}
      <Box>
        <Slider
          aria-label="time-indicator"
          size="small"
          value={position}
          min={0}
          step={1}
          max={duration}
          onChange={handleChange}
          sx={(t) => ({
            color: 'rgba(0,0,0,0.87)',
            height: 4,
            '& .MuiSlider-thumb': {
              width: 8,
              height: 8,
              transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
              '&::before': {
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
              },
              '&:hover, &.Mui-focusVisible': {
                boxShadow: `0px 0px 0px 8px ${'rgb(0 0 0 / 16%)'}`,
                ...t.applyStyles('dark', {
                  boxShadow: `0px 0px 0px 8px ${'rgb(255 255 255 / 16%)'}`,
                }),
              },
              '&.Mui-active': {
                width: 20,
                height: 20,
              },
            },
            '& .MuiSlider-rail': {
              opacity: 0.28,
            },
            ...t.applyStyles('dark', {
              color: '#fff',
            }),
          })}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: -2,
        }}
      >
        <TinyText>{formatDuration(position)}</TinyText>
        <TinyText>-{formatDuration(duration - position)}</TinyText>
      </Box>
      <Box
        sx={(theme) => ({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mt: -1,
          '& svg': {
            color: '#000',
            ...theme.applyStyles('dark', {
              color: '#fff',
            }),
          },
        })}
      >
        <IconButton aria-label="previous song">
          <FastRewindRounded fontSize="large" />
        </IconButton>
        <IconButton
          aria-label={paused ? 'play' : 'pause'}
          onClick={handlePlayPause}
        >
          {paused ? (
            <PlayArrowRounded sx={{ fontSize: '3rem' }} />
          ) : (
            <PauseRounded sx={{ fontSize: '3rem' }} />
          )}
        </IconButton>
        <IconButton aria-label="next song">
          <FastForwardRounded fontSize="large" />
        </IconButton>
      </Box>
      <Stack
        spacing={2}
        direction="row"
        sx={(theme) => ({
          mb: 1,
          px: 1,
          '& > svg': {
            color: 'rgba(0,0,0,0.4)',
            ...theme.applyStyles('dark', {
              color: 'rgba(255,255,255,0.4)',
            }),
          },
        })}
        alignItems="center"
      >
        <VolumeDownRounded />
        <Slider
          aria-label="Volume"
          defaultValue={30}
          sx={(t) => ({
            color: 'rgba(0,0,0,0.87)',
            '& .MuiSlider-track': {
              border: 'none',
            },
            '& .MuiSlider-thumb': {
              width: 24,
              height: 24,
              backgroundColor: '#fff',
              '&::before': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
              },
              '&:hover, &.Mui-focusVisible, &.Mui-active': {
                boxShadow: 'none',
              },
            },
            ...t.applyStyles('dark', {
              color: '#fff',
            }),
          })}
        />
      </Stack>
      {/* Plyr component */}
      <Plyr
        url={audioSource.src}
        type={audioSource.type}
        onInit={(player) => console.log(player)}
        onError={(error) => console.error(error)}
      />
    </Box>
  );
);