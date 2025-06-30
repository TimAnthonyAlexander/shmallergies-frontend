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
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner size="large" />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ textAlign: 'center' }}>
          <Avatar 
            sx={{ 
              width: 48, 
              height: 48, 
              mx: 'auto', 
              mb: 2,
              backgroundColor: 'primary.main'
            }}
          >
            <Person />
          </Avatar>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Your Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your personal allergy information for personalized safety checks.
          </Typography>
        </Box>

        {/* Success Message */}
        {success && (
          <Alert 
            severity="success" 
            icon={<CheckCircle />}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <ErrorMessage message={error} onDismiss={() => setError('')} />
        )}

        {/* User Info */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Account Information
          </Typography>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
            gap: 3 
          }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1">
                {user?.name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">
                {user?.email}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Allergies Section */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Your Allergies
            </Typography>
            {!isAddingAllergy && (
              <Button
                onClick={() => setIsAddingAllergy(true)}
                variant="contained"
                startIcon={<Add />}
                size="small"
              >
                Add Allergy
              </Button>
            )}
          </Box>

          {/* Add New Allergy Form */}
          {isAddingAllergy && (
            <Card sx={{ mb: 3, backgroundColor: 'grey.50' }}>
              <CardContent>
                <Box component="form" onSubmit={handleAddAllergy}>
                  <Stack spacing={2}>
                    <TextField
                      label="Allergy Description"
                      placeholder="e.g., Peanuts and tree nuts, Severe dairy allergy, Shellfish..."
                      value={newAllergyText}
                      onChange={(e) => setNewAllergyText(e.target.value)}
                      fullWidth
                      autoFocus
                      multiline
                      rows={2}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        disabled={!newAllergyText.trim()}
                        size="small"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setIsAddingAllergy(false);
                          setNewAllergyText('');
                        }}
                        variant="outlined"
                        startIcon={<Close />}
                        size="small"
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Allergies List */}
          {allergies.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Warning sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No allergies recorded
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add your allergies to get personalized safety checks when viewing products.
              </Typography>
              {!isAddingAllergy && (
                <Button
                  onClick={() => setIsAddingAllergy(true)}
                  variant="contained"
                  startIcon={<Add />}
                >
                  Add Your First Allergy
                </Button>
              )}
            </Box>
          ) : (
            <List>
              {allergies.map((allergy) => (
                <ListItem key={allergy.id} divider>
                  {editingId === allergy.id ? (
                    <Box sx={{ width: '100%' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          value={editAllergyText}
                          onChange={(e) => setEditAllergyText(e.target.value)}
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                        />
                        <Stack direction="column" spacing={0.5}>
                          <IconButton
                            onClick={() => handleUpdateAllergy(allergy.id)}
                            disabled={!editAllergyText.trim()}
                            color="primary"
                            size="small"
                          >
                            <Save />
                          </IconButton>
                          <IconButton
                            onClick={cancelEditing}
                            color="default"
                            size="small"
                          >
                            <Close />
                          </IconButton>
                        </Stack>
                      </Stack>
                    </Box>
                  ) : (
                    <>
                      <ListItemText
                        primary={allergy.allergy_text}
                        secondary={`Added ${formatDate(allergy.created_at)}`}
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            onClick={() => startEditing(allergy)}
                            color="primary"
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => openDeleteDialog(allergy.id)}
                            color="error"
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      </ListItemSecondaryAction>
                    </>
                  )}
                </ListItem>
              ))}
            </List>
          )}

          {allergies.length > 0 && (
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'info.lighter', borderRadius: 1 }}>
              <Typography variant="body2" color="info.dark">
                <strong>Note:</strong> Keep your allergy information accurate and up-to-date. 
                Always read product labels carefully and consult healthcare professionals for severe allergies.
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Allergy</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this allergy? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => allergyToDelete && handleDeleteAllergy(allergyToDelete)} 
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  );
};

export default Profile; 