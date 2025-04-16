import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { EventDetails } from '../../types/github';

interface IssueCommentEventProps {
  event: EventDetails;
}

export default function IssueCommentEvent({ event }: IssueCommentEventProps): React.JSX.Element | null {
  if (!event?.date) {
    return null;
  }

  const issue = event.payload?.issue;
  const comment = event.payload?.comment;
  if (!issue || !comment) {
    return null;
  }

  // Extract repository information
  const repoFullName = event.repo;
  const [repoOwner, repoName] = repoFullName.split('/');
  
  // Extract issue information
  const issueTitle = issue.title;
  const issueUrl = issue.html_url;
  const issueState = issue.state || 'unknown';
  const issueNumber = issue.number;
  const issueAuthor = issue.user?.login;
  const issueAuthorAvatar = issue.user?.avatar_url;
  
  // Extract comment information
  const commentUrl = comment.html_url;
  const commentBody = comment.body;
  const commentUser = comment.user?.login || event.user;
  const commentUserAvatar = comment.user?.avatar_url || event.avatarUrl;
  const commentCreatedAt = comment.created_at || event.date;

  // Get other comments if available
  const otherComments = event.payload?.comments || [];

  return (
    <Box sx={{ p: '16px' }}>
      {/* Header with repository, issue number and state */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {event.date}
        </Typography>
        <Chip 
          label={`${repoOwner}/${repoName}`}
          size="small"
          color="primary"
          variant="outlined"
        />
        <Chip 
          label={`#${issueNumber}`} 
          size="small" 
          color="default"
        />
        <Chip 
          label={issueState} 
          size="small" 
          color={issueState === 'open' ? 'success' : 'error'}
        />
      </Box>

      {/* Issue title as a link */}
      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
        <Link 
          href={issueUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          sx={{ textDecoration: 'none' }}
        >
          {issueTitle}
        </Link>
      </Typography>
      
      {/* Issue author if available */}
      {issueAuthor && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Issue by:
          </Typography>
          <Avatar 
            src={issueAuthorAvatar} 
            alt={issueAuthor}
            sx={{ width: 20, height: 20 }}
          />
          <Typography variant="body2">
            {issueAuthor}
          </Typography>
        </Box>
      )}

      {/* Comment information with avatar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Avatar 
          src={commentUserAvatar} 
          alt={commentUser}
          sx={{ width: 24, height: 24 }}
        />
        <Typography variant="body2">
          {commentUser}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          commented on {new Date(commentCreatedAt).toLocaleString()}
        </Typography>
      </Box>

      {/* Comment content */}
      <Box sx={{ 
        p: '16px', 
        backgroundColor: 'action.hover',
        borderRadius: 1,
        position: 'relative',
        mb: 2
      }}>
        <Typography 
          variant="body2" 
          sx={{ 
            whiteSpace: 'pre-wrap',
            maxHeight: 200,
            overflow: 'auto'
          }}
        >
          {commentBody}
        </Typography>
        <Box sx={{ 
          position: 'absolute',
          top: 8,
          right: 8
        }}>
          <Link
            href={commentUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              textDecoration: 'none',
              fontSize: '0.75rem'
            }}
          >
            View on GitHub
          </Link>
        </Box>
      </Box>

      {/* Other comments summary if available */}
      {otherComments.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Other comments on this issue:
          </Typography>
          {otherComments.slice(0, 3).map((otherComment: any) => (
            <Box 
              key={otherComment.id}
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 1
              }}
            >
              <Avatar 
                src={otherComment.user?.avatar_url} 
                alt={otherComment.user?.login}
                sx={{ width: 20, height: 20 }}
              />
              <Typography variant="body2">
                {otherComment.user?.login}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  flexGrow: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {otherComment.body?.substring(0, 50)}
                {otherComment.body?.length > 50 ? '...' : ''}
              </Typography>
            </Box>
          ))}
          {otherComments.length > 3 && (
            <Typography variant="caption" color="text.secondary">
              +{otherComments.length - 3} more comments
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
} 