import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { ClickAwayListener } from '@mui/base/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded';
import AdminPanelSettingsRounded from '@mui/icons-material/AdminPanelSettingsRounded';
import SvgHamburgerMenu from 'docs/src/icons/SvgHamburgerMenu';
import { Link } from '@stoked-ui/docs';
import { getApiUrl } from 'docs/src/modules/utils/getApiUrl';
import ROUTES from 'docs/src/route';
import { useAllProducts } from 'docs/src/products';
import { toAbsoluteSitePath } from 'docs/src/modules/utils/siteRouting';
import type { AuthUser, ManagedProduct } from 'docs/src/layouts/AppHeader';

const Anchor = styled('a')<{ component?: React.ElementType; noLinkStyle?: boolean }>(
  ({ theme }) => [
    {
      ...theme.typography.body2,
      fontWeight: theme.typography.fontWeightBold,
      textDecoration: 'none',
      border: 'none',
      width: '100%',
      backgroundColor: 'transparent',
      color: theme.palette.text.secondary,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(1),
      borderRadius: theme.spacing(1),
      transition: theme.transitions.create('background'),
      '&:hover, &:focus-visible': {
        backgroundColor: theme.palette.grey[100],
        '@media (hover: none)': {
          backgroundColor: 'transparent',
        },
      },
    },
    theme.applyDarkStyles({
      color: '#fff',
      '&:hover, &:focus-visible': {
        backgroundColor: theme.palette.primaryDark[700],
        '@media (hover: none)': {
          backgroundColor: 'transparent',
        },
      },
    }),
  ],
);

const UList = styled('ul')({
  listStyleType: 'none',
  padding: 0,
  margin: 0,
});

const CONSULTING_ITEMS: Array<{ name: string; description: string; href: string }> = [
  {
    name: 'Front End',
    description: 'React, Next.js, Angular, and TypeScript development.',
    href: ROUTES.consultingFrontEnd,
  },
  {
    name: 'Back End',
    description: 'Node.js, NestJS, Python, and cloud-native APIs.',
    href: ROUTES.consultingBackEnd,
  },
  {
    name: 'Full Stack',
    description: 'End-to-end product builds across UI, APIs, data, and deploy.',
    href: ROUTES.consultingFullStack,
  },
  {
    name: 'Devops',
    description: 'AWS, GCP, Terraform, and CI/CD pipelines.',
    href: ROUTES.consultingDevops,
  },
  {
    name: 'AI',
    description: 'AI integration, ML pipelines, and LLM applications.',
    href: ROUTES.consultingAi,
  },
];

const DOCS: Array<{ name: string; description: string; href: string; chip?: string }> = [
  {
    name: 'Material UI',
    description: "Component library that implements Google's Material Design.",
    href: ROUTES.materialDocs,
  },
  {
    name: 'Joy UI',
    description: "Component library that implements SUI's own in-house design principles.",
    href: ROUTES.joyDocs,
  },
  {
    name: 'Base UI',
    description: 'Unstyled React components and low-level hooks.',
    href: ROUTES.baseDocs,
  },
  {
    name: 'SUI System',
    description: 'CSS utilities for rapidly laying out custom designs.',
    href: ROUTES.systemDocs,
  },
  {
    name: 'SUI X',
    description: 'Advanced components for complex use cases.',
    href: ROUTES.xIntro,
  },
  {
    name: 'Toolpad',
    description: 'Low-code admin builder',
    href: ROUTES.toolpadStudioDocs,
    chip: 'Beta',
  },
];

interface HeaderNavDropdownProps {
  auth?: AuthUser | null;
  managedProducts?: ManagedProduct[];
}

export default function HeaderNavDropdown({ auth, managedProducts = [] }: HeaderNavDropdownProps) {
  const allProducts = useAllProducts();
  const [open, setOpen] = React.useState(false);
  const [productsOpen, setProductsOpen] = React.useState(true);
  const [docsOpen, setDocsOpen] = React.useState(false);
  const [consultingOpen, setConsultingOpen] = React.useState(false);
  const hambugerRef = React.useRef<HTMLButtonElement>(null);

  const isAdmin = auth?.role === 'admin';

  // Check if client has invoices (for conditional nav link)
  const [hasInvoices, setHasInvoices] = React.useState(false);
  React.useEffect(() => {
    if (!auth || auth.role !== 'client' || !auth.clientId) {return;}
    const stored = localStorage.getItem('auth');
    if (!stored) {return;}
    let token: string | null = null;
    try {
      token = JSON.parse(stored).access_token;
    } catch { /* ignore */ }
    if (!token) {return;}
    fetch(getApiUrl(`/api/invoices/has-invoices?clientId=${auth.clientId}`), {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.hasInvoices) {setHasInvoices(true);}
      })
      .catch(() => {});
  }, [auth]);

  return (
    <React.Fragment>
      <IconButton
        color="primary"
        aria-label="Menu"
        ref={hambugerRef}
        disableRipple
        onClick={() => setOpen((value) => !value)}
        sx={{
          position: 'relative',
          '& rect': {
            transformOrigin: 'center',
            transition: '0.2s',
          },
          ...(open && {
            '& rect:first-of-type': {
              transform: 'translate(1.5px, 1.6px) rotateZ(-45deg)',
            },
            '& rect:last-of-type': {
              transform: 'translate(1.5px, -1.2px) rotateZ(45deg)',
            },
          }),
        }}
      >
        <SvgHamburgerMenu/>
      </IconButton>
      <ClickAwayListener
        onClickAway={(event) => {
          if (!hambugerRef.current!.contains(event.target as Node)) {
            setOpen(false);
          }
        }}
      >
        <Collapse
          in={open}
          sx={(theme) => ({
            position: 'fixed',
            top: 56,
            left: 0,
            right: 0,
            boxShadow: `0px 16px 20px rgba(170, 180, 190, 0.3)`,
            ...theme.applyDarkStyles({
              boxShadow: '0px 16px 20px rgba(0, 0, 0, 0.8)',
            }),
          })}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: 'background.default',
              maxHeight: 'calc(100vh - 56px)',
              overflow: 'auto',
            }}
          >
            {auth ? (
              // Authenticated mobile nav
              <UList>
                {/* Products — same as non-auth, admin icon for admin */}
                <li>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Anchor
                      as="button"
                      onClick={() => setProductsOpen((bool) => !bool)}
                      sx={{ justifyContent: 'space-between', flex: 1 }}
                    >
                      Products
                      <KeyboardArrowDownRounded
                        color="primary"
                        sx={{
                          transition: '0.3s',
                          transform: productsOpen ? 'rotate(-180deg)' : 'rotate(0)',
                        }}
                      />
                    </Anchor>
                    {isAdmin && (
                      <Tooltip title="Products admin">
                        <Anchor
                          href={toAbsoluteSitePath('consulting', '/consulting/admin/products')}
                          as={Link}
                          noLinkStyle
                          sx={{ width: 'auto', px: 1 }}
                        >
                          <AdminPanelSettingsRounded sx={{ fontSize: 16 }} />
                        </Anchor>
                      </Tooltip>
                    )}
                  </Box>
                  <Collapse in={productsOpen}>
                    <UList>
                      {allProducts.live.map((item) => (
                        <li key={item.id}>
                          <Anchor
                            href={item.url(isAdmin ? 'admin' : 'product')}
                            as={Link}
                            noLinkStyle
                            sx={{ flexDirection: 'column', alignItems: 'initial' }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {item.name}
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                              {item.description}
                            </Typography>
                          </Anchor>
                        </li>
                      ))}
                    </UList>
                  </Collapse>
                </li>
                {/* Consulting — always visible */}
                <li>
                  <Anchor
                    as="button"
                    onClick={() => setConsultingOpen((bool) => !bool)}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    Consulting
                    <KeyboardArrowDownRounded
                      color="primary"
                      sx={{
                        transition: '0.3s',
                        transform: consultingOpen ? 'rotate(-180deg)' : 'rotate(0)',
                      }}
                    />
                  </Anchor>
                  <Collapse in={consultingOpen}>
                    <UList>
                      {CONSULTING_ITEMS.map((item) => (
                        <li key={item.name}>
                          <Anchor href={item.href} as={Link} noLinkStyle sx={{ flexDirection: 'column', alignItems: 'initial' }}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                              {item.name}
                            </Box>
                            <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                          </Anchor>
                        </li>
                      ))}
                    </UList>
                  </Collapse>
                </li>
                {/* About us — always visible */}
                <li>
                  <Anchor href={ROUTES.about} as={Link} noLinkStyle>About us</Anchor>
                </li>
                {/* Admin-only items */}
                {isAdmin && (
                  <React.Fragment>
                    <li>
                      <Anchor href={toAbsoluteSitePath('consulting', '/consulting/clients')} as={Link} noLinkStyle>
                        Clients
                      </Anchor>
                    </li>
                    <li>
                      <Anchor href={toAbsoluteSitePath('consulting', '/consulting/users')} as={Link} noLinkStyle>
                        Users
                      </Anchor>
                    </li>
                  </React.Fragment>
                )}
                {/* Client-only items */}
                {!isAdmin && (
                  <React.Fragment>
                    <li>
                      <Anchor href={toAbsoluteSitePath('consulting', `/consulting/clients/${auth.clientSlug || auth.clientId}`)} as={Link} noLinkStyle>
                        Deliverables
                      </Anchor>
                    </li>
                    {hasInvoices && (
                      <li>
                        <Anchor href={toAbsoluteSitePath('consulting', `/consulting/invoices?clientId=${auth.clientId}`)} as={Link} noLinkStyle>
                          Invoices
                        </Anchor>
                      </li>
                    )}
                    <li>
                      <Anchor href={toAbsoluteSitePath('consulting', '/consulting/users')} as={Link} noLinkStyle>
                        Users
                      </Anchor>
                    </li>
                  </React.Fragment>
                )}
                {/* Blog — same as non-auth, admin icon for admin */}
                <li>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Anchor href={ROUTES.blog} as={Link} noLinkStyle sx={{ flex: 1 }}>
                      Blog
                    </Anchor>
                    {isAdmin && (
                      <Tooltip title="Blog admin">
                        <Anchor href="/blog/editor" as={Link} noLinkStyle sx={{ width: 'auto', px: 1 }}>
                          <AdminPanelSettingsRounded sx={{ fontSize: 16 }} />
                        </Anchor>
                      </Tooltip>
                    )}
                  </Box>
                </li>
                {/* Docs — same dropdown as non-auth, admin icon for admin */}
                <li>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Anchor
                      as="button"
                      onClick={() => setDocsOpen((bool) => !bool)}
                      sx={{ justifyContent: 'space-between', flex: 1 }}
                    >
                      Docs
                      <KeyboardArrowDownRounded
                        color="primary"
                        sx={{
                          transition: '0.3s',
                          transform: docsOpen ? 'rotate(-180deg)' : 'rotate(0)',
                        }}
                      />
                    </Anchor>
                    {isAdmin && (
                      <Tooltip title="API docs admin">
                        <Anchor
                          href={toAbsoluteSitePath('consulting', '/consulting/api-docs')}
                          as={Link}
                          noLinkStyle
                          sx={{ width: 'auto', px: 1 }}
                        >
                          <AdminPanelSettingsRounded sx={{ fontSize: 16 }} />
                        </Anchor>
                      </Tooltip>
                    )}
                  </Box>
                  <Collapse in={docsOpen}>
                    <UList>
                      {DOCS.map((item) => (
                        <li key={item.name}>
                          <Anchor
                            href={item.href}
                            as={Link}
                            noLinkStyle
                            sx={{ flexDirection: 'column', alignItems: 'initial' }}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                              {item.name}
                              {item.chip ? (
                                <Chip size="small" label={item.chip} color="primary" variant="outlined" />
                              ) : null}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                          </Anchor>
                        </li>
                      ))}
                    </UList>
                  </Collapse>
                </li>
              </UList>
            ) : (
              // Unauthenticated mobile nav
              <UList
                sx={(theme) => ({
                  '& ul': {
                    borderLeft: '1px solid',
                    borderColor: 'grey.100',
                    ...theme.applyDarkStyles({
                      borderColor: 'primaryDark.700',
                    }),
                    pl: 1,
                    pb: 1,
                    ml: 1,
                  },
                })}
              >
                <li>
                  <Anchor
                    as="button"
                    onClick={() => setProductsOpen((bool) => !bool)}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    Products
                    <KeyboardArrowDownRounded
                      color="primary"
                      sx={{
                        transition: '0.3s',
                        transform: productsOpen ? 'rotate(-180deg)' : 'rotate(0)',
                      }}
                    />
                  </Anchor>
                  <Collapse in={productsOpen}>
                    <UList>
                      {allProducts.live.map((item) => (
                        <li key={item.id}>
                          <Anchor
                            href={item.url('product')}
                            as={Link}
                            noLinkStyle
                            sx={{ flexDirection: 'column', alignItems: 'initial' }}
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {item.name}
                              </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                              {item.description}
                            </Typography>
                          </Anchor>
                        </li>
                      ))}
                    </UList>
                  </Collapse>
                </li>
                <li>
                  <Anchor
                    as="button"
                    onClick={() => setConsultingOpen((bool) => !bool)}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    Consulting
                    <KeyboardArrowDownRounded
                      color="primary"
                      sx={{
                        transition: '0.3s',
                        transform: consultingOpen ? 'rotate(-180deg)' : 'rotate(0)',
                      }}
                    />
                  </Anchor>
                  <Collapse in={consultingOpen}>
                    <UList>
                      {CONSULTING_ITEMS.map((item) => (
                        <li key={item.name}>
                          <Anchor
                            href={item.href}
                            as={Link}
                            noLinkStyle
                            sx={{ flexDirection: 'column', alignItems: 'initial' }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                              }}
                            >
                              {item.name}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                          </Anchor>
                        </li>
                      ))}
                    </UList>
                  </Collapse>
                </li>
                <li>
                  <Anchor href={ROUTES.about} as={Link} noLinkStyle>
                    About us
                  </Anchor>
                </li>
                <li>
                  <Anchor href={ROUTES.blog} as={Link} noLinkStyle>
                    Blog
                  </Anchor>
                </li>
                <li>
                  <Anchor
                    as="button"
                    onClick={() => setDocsOpen((bool) => !bool)}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    Docs
                    <KeyboardArrowDownRounded
                      color="primary"
                      sx={{
                        transition: '0.3s',
                        transform: docsOpen ? 'rotate(-180deg)' : 'rotate(0)',
                      }}
                    />
                  </Anchor>
                  <Collapse in={docsOpen}>
                    <UList>
                      {DOCS.map((item) => (
                        <li key={item.name}>
                          <Anchor
                            href={item.href}
                            as={Link}
                            noLinkStyle
                            sx={{ flexDirection: 'column', alignItems: 'initial' }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                              }}
                            >
                              {item.name}
                              {item.chip ? (
                                <Chip
                                  size="small"
                                  label={item.chip}
                                  color="primary"
                                  variant="outlined"
                                />
                              ) : null}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                          </Anchor>
                        </li>
                      ))}
                    </UList>
                  </Collapse>
                </li>
              </UList>
            )}
          </Box>
        </Collapse>
      </ClickAwayListener>
    </React.Fragment>
  );
}
