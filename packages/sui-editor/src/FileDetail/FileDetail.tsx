import * as React from 'react';
import Player from 'lottie-react';
import { ITimelineAction } from '@stoked-ui/timeline';
import {yupResolver} from "@hookform/resolvers/yup";
import {useForm} from "react-hook-form";
import Plyr, {PlyrProps} from "plyr-react"
import * as yup from "yup";
import debounce from "lodash.debounce";
import { Popover, Typography, Box, Card, CardContent } from '@mui/material';
import {FileDetailProps} from "./FileDetail.types";
import ControlledText from './ControlledText';

/**
 * Format bytes as human-readable text.
 *
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 *
 * @return Formatted string.
 */
function humanFileSize(bytes: number, si=false, dp=1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10**dp;

  do {
    bytes /= thresh;
    // eslint-disable-next-line no-plusplus
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return `${bytes.toFixed(dp)} ${units[u]}`;
}


const item = {
  hidden: {opacity: 0, y: 40},
  show: {opacity: 1, y: 0},
};

const getSchema = (nameTester, action) => {
  const schemaObj = {
    x: yup.number().optional(),
    y: yup.number().optional(),
    width: yup.number().optional(),
    height: yup.number().optional(),
    trimEnd: yup.number().optional(),
    trimStart: yup.number().optional(),
    id: yup.string(),
  }
  return yup.object(schemaObj);
}

function FileDetail({ action, anchorEl, onClose }: FileDetailProps) {
  const open = Boolean(anchorEl);
  const queryParameters = new URLSearchParams(window.location.search)
  const editMode = queryParameters.get('edit');
  const { file } = action;
  const profile = {displayName: 'stoker'};
  let lastDisplayName = profile.displayName;
  const nameTester = async value => {
    if (value.length < 4) {
      return false;
    }
    if (value !== 'stoker') {
      lastDisplayName = value;
      return new Promise(resolve => {
        debounce(async displayName => {
            try {
              const res = displayName
              resolve(res);
            } catch (e) {
              resolve(false);
            }
          },
          900,
          {leading: true}
        )(value);
      });
    }
    return true;
  }
  const schema = getSchema(nameTester, action);


  const getDefaultValues = (action: ITimelineAction) => {
    const { element } = action;

    return {
      width: element.clientWidth ,
      height: element.clientHeight,
      x: element.x,
      y: element.y,
      id: action?.id,
      trimEnd: action?.trimEnd,
      trimStart: action?.trimStart

    };
  }
  const defaultValues = getDefaultValues(action);
  const {
    control,
    handleSubmit,
    formState,
    reset,
    setValue,
  } = useForm<{ width?: number; height?: number; x?: number; y?: number; id?: string; trimEnd?: number; trimStart?: number }>({
    mode: 'onChange',
    defaultValues,
    resolver: yupResolver(schema),
  });

  const renderMediaContent = () => {
    switch (file?.mediaType) {
      case 'video': {
        const plyrProps: PlyrProps = {
          source: {
            type: 'video',
            title: action.name,
            sources: [
              {
                src: action.src,
              },
            ],
          },
        }

        return (
          <div style={{width: '500px'}}>
            <Plyr {...plyrProps} />
              <div className="md:flex">
                <div className="flex flex-col flex-1 md:ltr:pr-32 md:rtl:pl-32">
                  <form id={'profile'} className={`form ${editMode ? 'editableForm' : 'disabledForm'}`}>
                     <Card component={Box}
                           className="w-full mb-16">
                       <CardContent className="px-32 py-24 flex flex-row flex-wrap gap-[0.8rem]">
                         <div className=" mb-24 w-[182px] flex-grow flex">
                           <ControlledText
                             className={'whitespace-nowrap flex-grow flex'}
                             label={'x'}
                             control={control}
                             disabled={!editMode}
                           />
                         </div>
                         <div className="mb-24 w-[212px] flex-grow flex">
                           <ControlledText
                             className={'whitespace-nowrap flex-grow flex'}
                             label={'y'}
                             control={control}
                             disabled={!editMode}
                           />
                         </div>
                         <div className=" mb-24 w-[182px] flex-grow flex">
                           <ControlledText
                             className={'whitespace-nowrap flex-grow flex'}
                             label={'Width'}
                             control={control}
                             disabled={!editMode}
                           />
                         </div>
                         <div className="mb-24 w-[212px] flex-grow flex">
                           <ControlledText
                             className={'whitespace-nowrap flex-grow flex'}
                             label={'Height'}
                             control={control}
                             disabled={!editMode}
                           />
                         </div>

                         <div className="mb-24 flex-grow flex">
                           <ControlledText
                             className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
                             label={'Start Trim'}
                             control={control}
                             disabled={!editMode}
                           />
                         </div>
                         <div className="mb-24 flex-grow flex">
                           <ControlledText
                             className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
                             label={'End Trim'}
                             control={control}
                             disabled={!editMode}
                           />
                         </div>
                         <div className="mb-24 flex-grow flex">
                           <ControlledText
                             className={'w-[194px] whitespace-nowrap w-full flex-grow flex'}
                             label={'Duration'}
                             control={control}
                             disabled
                           />
                         </div>
                       </CardContent>
                     </Card>
                </form>
              </div>
            </div>
            <Typography variant="body2">Duration: {action.duration} seconds</Typography>
          </div>);
      }
      case 'audio':
        return (
          <div>
            <audio src={file.url} controls />
            <Typography variant="body2">Duration: {file.duration} seconds</Typography>
          </div>
        );
      case 'image':
        return (
          <div>
            <img src={file.url} alt={file.name} style={{ maxWidth: '100%' }} />
            <Typography variant="body2">Resolution: {file.size} bytes</Typography>
          </div>
        );
      case 'lottie':
        return (
          <div>
            <Player src={file.url} loop autoplay animationData={undefined} />
            <Typography variant="body2">Lottie Animation</Typography>
          </div>
        );
      default:
        return <Typography>No preview available</Typography>;
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'center',
      }}
    >
      <Box p={2}>
        <Typography variant="h6">{action.name}</Typography>
        {renderMediaContent()}
        {action.file?.mediaType && <Typography variant="body2">Type: {action.file.mediaType}</Typography>}
        {action.file?.size && <Typography variant="body2">Size: {humanFileSize(action.file.size)} bytes</Typography> }
      </Box>
    </Popover>
  );
};

export default FileDetail;
