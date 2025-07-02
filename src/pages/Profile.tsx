import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Stack,
  Button,
  TextField,
  Card,
  CardContent,
  IconButton,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar
} from '@mui/material';
import { 
  Person,
  Add,
  Edit,
  Delete,
  Save,
  Close,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiClient, type ApiError } from '../lib/api';
import type { UserAllergy } from '../types';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ErrorMessage from '../components/UI/ErrorMessage';

const Profile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [allergies, setAllergies] = useState<UserAllergy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingAllergy, setIsAddingAllergy] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newAllergyText, setNewAllergyText] = useState('');
  const [editAllergyText, setEditAllergyText] = useState('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [allergyToDelete, setAllergyToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadAllergies();
  }, []);

  const loadAllergies = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.getUserAllergies();
      setAllergies(response.allergies);
    } catch (err: any) {
      setError(err.message || 'Failed to load allergies');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllergyText.trim()) return;

    try {
      const response = await apiClient.addUserAllergy({ allergy_text: newAllergyText.trim() });
      setAllergies([...allergies, response.allergy]);
      setNewAllergyText('');
      setIsAddingAllergy(false);
      setSuccess('Allergy added successfully');
      refreshUser(); // Refresh user data in context
    } catch (err: any) {
      setError(err.message || 'Failed to add allergy');
    }
  };

  const handleUpdateAllergy = async (id: number) => {
    if (!editAllergyText.trim()) return;

    try {
      const response = await apiClient.updateUserAllergy(id, { allergy_text: editAllergyText.trim() });
      setAllergies(allergies.map(allergy => 
        allergy.id === id ? response.allergy : allergy
      ));
      setEditingId(null);
      setEditAllergyText('');
      setSuccess('Allergy updated successfully');
      refreshUser(); // Refresh user data in context
    } catch (err: any) {
      setError(err.message || 'Failed to update allergy');
    }
  };

  const handleDeleteAllergy = async (id: number) => {
    try {
      await apiClient.deleteUserAllergy(id);
      setAllergies(allergies.filter(allergy => allergy.id !== id));
      setSuccess('Allergy deleted successfully');
      setDeleteDialogOpen(false);
      setAllergyToDelete(null);
      refreshUser(); // Refresh user data in context
    } catch (err: any) {
      setError(err.message || 'Failed to delete allergy');
    }
  };

  const startEditing = (allergy: UserAllergy) => {
    setEditingId(allergy.id);
    setEditAllergyText(allergy.allergy_text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditAllergyText('');
  };

  const openDeleteDialog = (id: number) => {
    setAllergyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <LoadingSpinner size="large" />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      py: { xs: 4, md: 8 }
    }}>
      <Container maxWidth="md" sx={{ px: { xs: 3, md: 6 } }}>
        <Stack spacing={{ xs: 6, md: 10 }}>
          {/* Header */}
          <Box sx={{ 
            textAlign: 'center',
            maxWidth: 800,
            mx: 'auto'
          }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#1a1a1a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4
            }}>
              <Person sx={{ fontSize: 32, color: '#ffffff' }} />
            </Box>
            <Typography 
              variant="h1"
              sx={{ 
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 300,
                letterSpacing: '-0.04em',
                color: '#1a1a1a',
                mb: 3,
                lineHeight: 1.1
              }}
            >
              Profile
            </Typography>
            <Typography 
              variant="h5"
              sx={{ 
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                fontWeight: 400,
                color: '#666666',
                lineHeight: 1.5
              }}
            >
              Manage your personal information and allergy preferences
            </Typography>
          </Box>

          {/* Success Message */}
          {success && (
            <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
              <Alert 
                severity="success" 
                icon={<CheckCircle />}
                onClose={() => setSuccess('')}
                sx={{
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  color: '#1a1a1a',
                  '& .MuiAlert-icon': {
                    color: '#4caf50'
                  },
                  '& .MuiAlert-message': {
                    fontSize: '0.95rem',
                    fontWeight: 400
                  }
                }}
              >
                {success}
              </Alert>
            </Box>
          )}

          {/* Error Message */}
          {error && (
            <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
              <ErrorMessage message={error} onDismiss={() => setError('')} />
            </Box>
          )}

          {/* Account Information */}
          <Box sx={{ 
            maxWidth: 800,
            mx: 'auto',
            width: '100%'
          }}>
            <Box sx={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e8e8e8',
              p: { xs: 4, md: 6 }
            }}>
              <Typography 
                variant="h4"
                sx={{ 
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: '#1a1a1a',
                  mb: 4,
                  letterSpacing: '-0.02em'
                }}
              >
                Account
              </Typography>
              
              <Box sx={{ 
                display: 'grid',
                gap: 4
              }}>
                <Box>
                  <Typography 
                    variant="overline" 
                    sx={{ 
                      color: '#999999',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      mb: 1,
                      display: 'block'
                    }}
                  >
                    Full Name
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#1a1a1a',
                      fontWeight: 400,
                      fontSize: '1.1rem'
                    }}
                  >
                    {user?.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography 
                    variant="overline" 
                    sx={{ 
                      color: '#999999',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      mb: 1,
                      display: 'block'
                    }}
                  >
                    Email Address
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#1a1a1a',
                      fontWeight: 400,
                      fontSize: '1.1rem'
                    }}
                  >
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Allergies Section */}
          <Box sx={{ 
            maxWidth: 800,
            mx: 'auto',
            width: '100%'
          }}>
            <Box sx={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e8e8e8',
              p: { xs: 4, md: 6 }
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                mb: 5
              }}>
                <Typography 
                  variant="h4"
                  sx={{ 
                    fontSize: '1.5rem',
                    fontWeight: 400,
                    color: '#1a1a1a',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Allergies
                </Typography>
                {!isAddingAllergy && (
                  <Button
                    onClick={() => setIsAddingAllergy(true)}
                    startIcon={<Add sx={{ fontSize: 18 }} />}
                    sx={{
                      color: '#666666',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        transition: 'background-color 0.2s ease'
                      }
                    }}
                  >
                    Add Allergy
                  </Button>
                )}
              </Box>

              {/* Add New Allergy Form */}
              {isAddingAllergy && (
                <Box sx={{ 
                  mb: 5,
                  p: 4,
                  backgroundColor: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid #e8e8e8'
                }}>
                  <Box component="form" onSubmit={handleAddAllergy}>
                    <Stack spacing={3}>
                      <TextField
                        label="Describe your allergy"
                        placeholder="e.g., Severe peanut allergy, Lactose intolerant, Shellfish sensitivity..."
                        value={newAllergyText}
                        onChange={(e) => setNewAllergyText(e.target.value)}
                        fullWidth
                        autoFocus
                        multiline
                        rows={3}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#ffffff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 400,
                            '& fieldset': {
                              border: 'none'
                            },
                            '&:hover': {
                              borderColor: '#d0d0d0',
                              transition: 'border-color 0.2s ease'
                            },
                            '&.Mui-focused': {
                              borderColor: '#333333',
                              boxShadow: '0 0 0 3px rgba(51, 51, 51, 0.05)'
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: '#666666',
                            fontSize: '0.95rem',
                            fontWeight: 500
                          }
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          type="submit"
                          disabled={!newAllergyText.trim()}
                          sx={{
                            backgroundColor: '#1a1a1a',
                            color: '#ffffff',
                            borderRadius: '12px',
                            px: 4,
                            py: 1.5,
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                              backgroundColor: '#333333',
                              boxShadow: 'none',
                              transition: 'background-color 0.2s ease'
                            },
                            '&:disabled': {
                              backgroundColor: '#e0e0e0',
                              color: '#999999'
                            }
                          }}
                        >
                          Save Allergy
                        </Button>
                        <Button
                          onClick={() => {
                            setIsAddingAllergy(false);
                            setNewAllergyText('');
                          }}
                          sx={{
                            color: '#666666',
                            borderRadius: '12px',
                            px: 3,
                            py: 1.5,
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            textTransform: 'none',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              transition: 'background-color 0.2s ease'
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                </Box>
              )}

              {/* Allergies List */}
              {allergies.length === 0 ? (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: { xs: 6, md: 8 }
                }}>
                  <Box sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 4
                  }}>
                    <Warning sx={{ fontSize: 28, color: '#cccccc' }} />
                  </Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontSize: '1.4rem',
                      fontWeight: 400,
                      color: '#1a1a1a',
                      mb: 2,
                      lineHeight: 1.3
                    }}
                  >
                    No allergies recorded
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#666666',
                      mb: 5,
                      lineHeight: 1.6,
                      fontSize: '1rem'
                    }}
                  >
                    Add your allergies for personalized safety alerts
                  </Typography>
                  {!isAddingAllergy && (
                    <Button
                      onClick={() => setIsAddingAllergy(true)}
                      sx={{
                        backgroundColor: '#1a1a1a',
                        color: '#ffffff',
                        borderRadius: '12px',
                        px: 6,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': {
                          backgroundColor: '#333333',
                          boxShadow: 'none',
                          transition: 'background-color 0.2s ease'
                        }
                      }}
                    >
                      Add First Allergy
                    </Button>
                  )}
                </Box>
              ) : (
                <Stack spacing={3}>
                  {allergies.map((allergy) => (
                    <Box 
                      key={allergy.id}
                      sx={{
                        p: 4,
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                        border: '1px solid #e8e8e8',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                          borderColor: '#d0d0d0'
                        }
                      }}
                    >
                      {editingId === allergy.id ? (
                        <Stack spacing={3}>
                          <TextField
                            value={editAllergyText}
                            onChange={(e) => setEditAllergyText(e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: '#ffffff',
                                border: '1px solid #e0e0e0',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: 400,
                                '& fieldset': {
                                  border: 'none'
                                },
                                '&:hover': {
                                  borderColor: '#d0d0d0',
                                  transition: 'border-color 0.2s ease'
                                },
                                '&.Mui-focused': {
                                  borderColor: '#333333',
                                  boxShadow: '0 0 0 3px rgba(51, 51, 51, 0.05)'
                                }
                              }
                            }}
                          />
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                              onClick={() => handleUpdateAllergy(allergy.id)}
                              disabled={!editAllergyText.trim()}
                              sx={{
                                backgroundColor: '#1a1a1a',
                                color: '#ffffff',
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                textTransform: 'none',
                                boxShadow: 'none',
                                '&:hover': {
                                  backgroundColor: '#333333',
                                  boxShadow: 'none',
                                  transition: 'background-color 0.2s ease'
                                },
                                '&:disabled': {
                                  backgroundColor: '#e0e0e0',
                                  color: '#999999'
                                }
                              }}
                            >
                              Save
                            </Button>
                            <Button
                              onClick={cancelEditing}
                              sx={{
                                color: '#666666',
                                borderRadius: '8px',
                                px: 3,
                                py: 1,
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                textTransform: 'none',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                  transition: 'background-color 0.2s ease'
                                }
                              }}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Stack>
                      ) : (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          justifyContent: 'space-between',
                          gap: 3
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: '#1a1a1a',
                                fontWeight: 400,
                                fontSize: '1rem',
                                lineHeight: 1.6,
                                mb: 2
                              }}
                            >
                              {allergy.allergy_text}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: '#999999',
                                fontSize: '0.8rem',
                                fontWeight: 500
                              }}
                            >
                              Added {formatDate(allergy.created_at)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              onClick={() => startEditing(allergy)}
                              sx={{
                                width: 36,
                                height: 36,
                                backgroundColor: '#f0f0f0',
                                color: '#666666',
                                borderRadius: '8px',
                                '&:hover': {
                                  backgroundColor: '#e8e8e8',
                                  transition: 'background-color 0.2s ease'
                                }
                              }}
                            >
                              <Edit sx={{ fontSize: 16 }} />
                            </IconButton>
                            <IconButton
                              onClick={() => openDeleteDialog(allergy.id)}
                              sx={{
                                width: 36,
                                height: 36,
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                borderRadius: '8px',
                                '&:hover': {
                                  backgroundColor: '#fee2e2',
                                  transition: 'background-color 0.2s ease'
                                }
                              }}
                            >
                              <Delete sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              )}

              {allergies.length > 0 && (
                <Box sx={{ 
                  mt: 5, 
                  p: 4,
                  backgroundColor: '#f0f8ff',
                  borderRadius: '12px',
                  border: '1px solid #e3f2fd'
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#1976d2',
                      lineHeight: 1.6,
                      fontSize: '0.9rem'
                    }}
                  >
                    <strong>Important:</strong> Keep your allergy information current and detailed. 
                    Always verify product labels and consult healthcare professionals for medical advice.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Delete Confirmation Dialog */}
          <Dialog 
            open={deleteDialogOpen} 
            onClose={() => setDeleteDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '16px',
                border: '1px solid #e8e8e8',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                p: 2
              }
            }}
          >
            <DialogTitle sx={{ 
              color: '#1a1a1a',
              fontWeight: 400,
              fontSize: '1.25rem',
              pb: 2
            }}>
              Delete Allergy
            </DialogTitle>
            <DialogContent sx={{ pb: 3 }}>
              <Typography 
                sx={{ 
                  color: '#666666', 
                  lineHeight: 1.6,
                  fontSize: '1rem'
                }}
              >
                Are you sure you want to remove this allergy from your profile? 
                This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button 
                onClick={() => setDeleteDialogOpen(false)}
                sx={{
                  color: '#666666',
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    transition: 'background-color 0.2s ease'
                  }
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => allergyToDelete && handleDeleteAllergy(allergyToDelete)} 
                sx={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  borderRadius: '12px',
                  px: 4,
                  py: 1.5,
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  boxShadow: 'none',
                  ml: 2,
                  '&:hover': {
                    backgroundColor: '#b91c1c',
                    boxShadow: 'none',
                    transition: 'background-color 0.2s ease'
                  }
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </Stack>
      </Container>
    </Box>
  );
};

export default Profile; 