import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { ViewState } from '../../types';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import GoogleIcon from '@mui/icons-material/Google';

type AuthMode = 'login' | 'register';

interface AuthSwipeProps {
  initialMode?: AuthMode;
  onNavigate: (view: ViewState) => void;
  onBack?: () => void;
}

const AuthSwipe: React.FC<AuthSwipeProps> = ({ initialMode = 'login', onNavigate, onBack }) => {
  const { signIn, signInWithGoogle, signUp } = useAuth();
  const reduceMotion = useReducedMotion();
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [mode, setMode] = useState<AuthMode>(initialMode);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regMismatch, setRegMismatch] = useState<string | null>(null);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const changeMode = (next: AuthMode) => {
    setMode(next);
    if (next === 'login') setRegMismatch(null);
  };

  useEffect(() => {
    changeMode(initialMode);
  }, [initialMode]);

  const header = useMemo(() => {
    if (mode === 'register') {
      return { title: 'Create your account', subtitle: 'Start your preparation journey today' };
    }
    return { title: 'Welcome back', subtitle: 'Sign in to continue your preparation' };
  }, [mode]);

  const formMotion = reduceMotion
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 } };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const { error } = await signIn(loginEmail, loginPassword);
      if (error) throw error;
      toast.success('Welcome back!');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to sign in');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      toast.error(err?.message || 'Google sign in failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setRegMismatch("Passwords don't match");
      toast.error("Passwords don't match");
      return;
    }
    setRegMismatch(null);

    setRegLoading(true);
    try {
      const { error: signUpError } = await signUp(regEmail, regPassword, regFullName);
      if (signUpError) throw signUpError;
      try {
        localStorage.setItem('cssprep:post_auth_redirect_view', 'PRICING');
      } catch {}
      toast.success('Account created successfully!');
      changeMode('login');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create account');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 5, md: 8 },
        px: 2,
        bgcolor: 'background.default',
        backgroundImage:
          'radial-gradient(1000px circle at 20% 20%, rgba(22, 163, 74, 0.22), transparent 55%), radial-gradient(900px circle at 80% 20%, rgba(16, 185, 129, 0.18), transparent 55%), radial-gradient(800px circle at 50% 90%, rgba(15, 23, 42, 0.14), transparent 55%)'
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: 'hidden',
            bgcolor: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(148, 163, 184, 0.25)',
            boxShadow: '0 18px 70px rgba(2, 6, 23, 0.18)'
          }}
        >
          <Grid container>
            <Grid
              item
              md={5}
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: 4,
                color: 'common.white',
                position: 'relative',
                background: 'linear-gradient(155deg, #14532d 0%, #16a34a 45%, #22c55e 100%)'
              }}
            >
              <Box sx={{ position: 'absolute', inset: 0, opacity: 0.18, pointerEvents: 'none' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -140,
                    left: -140,
                    width: 320,
                    height: 320,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.25)',
                    filter: 'blur(50px)'
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -180,
                    right: -160,
                    width: 360,
                    height: 360,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.20)',
                    filter: 'blur(60px)'
                  }}
                />
              </Box>

              <Box sx={{ position: 'relative' }}>
                {onBack ? (
                  <Button
                    onClick={onBack}
                    startIcon={<ArrowBackRoundedIcon />}
                    sx={{ color: 'rgba(255,255,255,0.92)', justifyContent: 'flex-start', px: 0 }}
                  >
                    Back
                  </Button>
                ) : null}

                <Typography variant="overline" sx={{ display: 'block', opacity: 0.85, mt: onBack ? 3 : 0 }}>
                  Welcome to
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.1, mt: 1 }}>
                  CSS Daily Prep
                </Typography>
                <Typography sx={{ mt: 1.5, opacity: 0.9 }}>
                  Daily current affairs, smart notes, quizzes, and curated resources—everything in one place.
                </Typography>

                <Stack spacing={1.2} sx={{ mt: 4 }}>
                  {['Fast workflows', 'Mobile-first experience', 'Secure authentication'].map((text) => (
                    <Stack key={text} direction="row" spacing={1.2} alignItems="center">
                      <CheckCircleRoundedIcon fontSize="small" />
                      <Typography sx={{ fontWeight: 700 }}>{text}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              <Typography variant="caption" sx={{ position: 'relative', opacity: 0.85 }}>
                © {new Date().getFullYear()} CSS Daily Prep
              </Typography>
            </Grid>

            <Grid item xs={12} md={7}>
              <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>
                      {header.title}
                    </Typography>
                    <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>{header.subtitle}</Typography>
                  </Box>

                  {onBack && !mdUp ? (
                    <IconButton onClick={onBack} aria-label="Back">
                      <ArrowBackRoundedIcon />
                    </IconButton>
                  ) : null}
                </Stack>

                <Tabs
                  value={mode === 'login' ? 0 : 1}
                  onChange={(_, v) => changeMode(v === 0 ? 'login' : 'register')}
                  variant="fullWidth"
                  sx={{ mt: 3 }}
                >
                  <Tab label="Sign in" />
                  <Tab label="Sign up" />
                </Tabs>

                <Box sx={{ mt: 3 }}>
                  <AnimatePresence mode="wait">
                    {mode === 'login' ? (
                      <motion.div key="login" {...formMotion}>
                        <Box component="form" onSubmit={handleLogin}>
                          <Stack spacing={2.2}>
                            <TextField
                              label="Email address"
                              type="email"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              autoComplete="email"
                              required
                              fullWidth
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <EmailOutlinedIcon />
                                  </InputAdornment>
                                )
                              }}
                            />

                            <TextField
                              label="Password"
                              type={showLoginPassword ? 'text' : 'password'}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              autoComplete="current-password"
                              required
                              fullWidth
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockOutlinedIcon />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                                      onClick={() => setShowLoginPassword((s) => !s)}
                                      edge="end"
                                    >
                                      {showLoginPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }}
                            />

                            <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mt: 0.5 }}>
                              <Button size="small" onClick={() => onNavigate('AUTH_FORGOT')}>
                                Forgot password?
                              </Button>
                              <Button size="small" color="inherit" onClick={() => onNavigate('PRICING')}>
                                View pricing
                              </Button>
                            </Stack>

                            <Button
                              type="submit"
                              variant="contained"
                              size="large"
                              disabled={loginLoading}
                              sx={{ py: 1.35, fontWeight: 900 }}
                              fullWidth
                            >
                              {loginLoading ? (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <CircularProgress size={18} color="inherit" />
                                  <span>Signing in…</span>
                                </Stack>
                              ) : (
                                'Sign in'
                              )}
                            </Button>

                            <Divider>or</Divider>

                            <Button
                              type="button"
                              variant="outlined"
                              size="large"
                              onClick={handleGoogleLogin}
                              startIcon={<GoogleIcon />}
                              sx={{ py: 1.25, fontWeight: 800 }}
                              fullWidth
                            >
                              Continue with Google
                            </Button>

                            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                              Don’t have an account?{' '}
                              <Button
                                type="button"
                                onClick={() => changeMode('register')}
                                sx={{ fontWeight: 900, p: 0, minWidth: 0, textTransform: 'none' }}
                              >
                                Sign up
                              </Button>
                            </Typography>
                          </Stack>
                        </Box>
                      </motion.div>
                    ) : (
                      <motion.div key="register" {...formMotion}>
                        <Box component="form" onSubmit={handleRegister}>
                          <Stack spacing={2.2}>
                            <TextField
                              label="Full name"
                              value={regFullName}
                              onChange={(e) => setRegFullName(e.target.value)}
                              autoComplete="name"
                              required
                              fullWidth
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonOutlineOutlinedIcon />
                                  </InputAdornment>
                                )
                              }}
                            />

                            <TextField
                              label="Email address"
                              type="email"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              autoComplete="email"
                              required
                              fullWidth
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <EmailOutlinedIcon />
                                  </InputAdornment>
                                )
                              }}
                            />

                            <TextField
                              label="Password"
                              type={showRegPassword ? 'text' : 'password'}
                              value={regPassword}
                              onChange={(e) => {
                                const v = e.target.value;
                                setRegPassword(v);
                                if (regConfirmPassword && v !== regConfirmPassword) setRegMismatch("Passwords don't match");
                                else setRegMismatch(null);
                              }}
                              autoComplete="new-password"
                              required
                              fullWidth
                              helperText="Minimum 8 characters recommended"
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockOutlinedIcon />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                                      onClick={() => setShowRegPassword((s) => !s)}
                                      edge="end"
                                    >
                                      {showRegPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }}
                            />

                            <TextField
                              label="Confirm password"
                              type={showRegConfirmPassword ? 'text' : 'password'}
                              value={regConfirmPassword}
                              onChange={(e) => {
                                const v = e.target.value;
                                setRegConfirmPassword(v);
                                if (regPassword && regPassword !== v) setRegMismatch("Passwords don't match");
                                else setRegMismatch(null);
                              }}
                              autoComplete="new-password"
                              required
                              fullWidth
                              error={!!regMismatch}
                              helperText={regMismatch ?? ' '}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LockOutlinedIcon />
                                  </InputAdornment>
                                ),
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton
                                      aria-label={showRegConfirmPassword ? 'Hide password' : 'Show password'}
                                      onClick={() => setShowRegConfirmPassword((s) => !s)}
                                      edge="end"
                                    >
                                      {showRegConfirmPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                                    </IconButton>
                                  </InputAdornment>
                                )
                              }}
                            />

                            <Button
                              type="submit"
                              variant="contained"
                              size="large"
                              disabled={regLoading || !!regMismatch}
                              sx={{ py: 1.35, fontWeight: 900 }}
                              fullWidth
                            >
                              {regLoading ? (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <CircularProgress size={18} color="inherit" />
                                  <span>Creating…</span>
                                </Stack>
                              ) : (
                                'Sign up'
                              )}
                            </Button>

                            <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mt: 0.5 }}>
                              <Button size="small" color="inherit" onClick={() => onNavigate('PRICING')}>
                                View pricing
                              </Button>
                              <Button size="small" onClick={() => changeMode('login')}>
                                Already have an account?
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthSwipe;
