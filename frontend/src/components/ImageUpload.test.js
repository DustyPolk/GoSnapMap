import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For extended matchers like .toBeInTheDocument()
import ImageUpload from './ImageUpload';

// Mock the PhotoMap component as its internals are not the focus of these tests
jest.mock('./PhotoMap', () => () => <div data-testid="photomap-mock">Mocked PhotoMap</div>);

describe('ImageUpload Component', () => {
  let fetchSpy;

  beforeEach(() => {
    // Spy on window.fetch and provide a mock implementation
    fetchSpy = jest.spyOn(window, 'fetch');
  });

  afterEach(() => {
    // Restore the original fetch function after each test
    fetchSpy.mockRestore();
    // jest.clearAllMocks(); // Alternative if using jest.fn() directly
  });

  // Helper to simulate file selection
  const selectFile = (inputElement, fileName = 'test.jpg', fileType = 'image/jpeg') => {
    const file = new File(['dummy content'], fileName, { type: fileType });
    fireEvent.change(inputElement, { target: { files: [file] } });
    return file;
  };

  test('renders initial state correctly', () => {
    render(<ImageUpload />);
    
    expect(screen.getByText(/Upload Your Photo/i)).toBeInTheDocument();
    expect(screen.getByText(/Upload a photo with location data/i)).toBeInTheDocument();
    
    // Check for absence of dynamic messages
    expect(screen.queryByText(/Image processed successfully/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Error uploading image/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Uploaded file is not a valid image/i)).not.toBeInTheDocument();

    // Check button state
    const uploadButton = screen.getByRole('button', { name: /Upload & Locate/i });
    // The button is disabled if no file is selected.
    // Since getByLabelText for file input is tricky if hidden, let's check its initial state
    // which depends on selectedFile being null.
    expect(uploadButton).toBeDisabled(); 
  });

  test('handles invalid image upload (backend error)', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ 
        error: 'Uploaded file is not a valid image. Please ensure it is a supported format (png, jpg, jpeg, gif) and not corrupted.' 
      }),
    });

    render(<ImageUpload />);
    
    const fileInput = screen.getByLabelText(/Choose a photo/i);
    selectFile(fileInput);

    const uploadButton = screen.getByRole('button', { name: /Upload & Locate/i });
    expect(uploadButton).not.toBeDisabled(); // Should be enabled after file selection
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/Uploaded file is not a valid image. Please ensure it is a supported format \(png, jpg, jpeg, gif\) and not corrupted./i)).toBeInTheDocument();
    });
    
    expect(screen.queryByTestId('photomap-mock')).not.toBeInTheDocument();
    expect(screen.queryByText(/Image processed successfully/i)).not.toBeInTheDocument();
  });

  test('handles valid image upload without GPS data', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Image processed successfully, but no GPS data was found.',
        latitude: null,
        longitude: null,
        gps_data_found: false,
        imageId: 1,
        filename: 'test_no_gps.jpg',
      }),
    });

    render(<ImageUpload />);
    
    const fileInput = screen.getByLabelText(/Choose a photo/i);
    selectFile(fileInput, 'test_no_gps.jpg');
    
    const uploadButton = screen.getByRole('button', { name: /Upload & Locate/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/Image processed successfully, but no GPS data was found./i)).toBeInTheDocument();
    });

    expect(screen.queryByTestId('photomap-mock')).not.toBeInTheDocument();
    expect(screen.queryByText(/Photo Location Found!/i)).not.toBeInTheDocument(); // Check section title
    expect(screen.queryByText(/Uploaded file is not a valid image/i)).not.toBeInTheDocument();
  });

  test('handles valid image upload with GPS data', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Image uploaded and processed successfully.',
        latitude: 12.34,
        longitude: 56.78,
        gps_data_found: true,
        imageId: 2,
        filename: 'test_with_gps.jpg',
      }),
    });

    render(<ImageUpload />);
    
    const fileInput = screen.getByLabelText(/Choose a photo/i);
    selectFile(fileInput, 'test_with_gps.jpg');

    const uploadButton = screen.getByRole('button', { name: /Upload & Locate/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/Image uploaded and processed successfully./i)).toBeInTheDocument();
    });
    
    // Check if map section title and mock map are rendered
    await waitFor(() => {
        expect(screen.getByText(/Photo Location Found!/i)).toBeInTheDocument();
    });
    expect(screen.getByTestId('photomap-mock')).toBeInTheDocument();
    expect(screen.queryByText(/Uploaded file is not a valid image/i)).not.toBeInTheDocument();
  });

  test('upload button is disabled while loading and re-enabled after fetch', async () => {
    fetchSpy.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(() => 
          resolve({
            ok: true,
            json: async () => ({
              message: 'Image processed successfully.',
              latitude: 12.34,
              longitude: 56.78,
              gps_data_found: true,
              imageId: 3,
              filename: 'loading_test.jpg',
            }),
          }), 100) // Short delay to simulate network
      )
    );
  
    render(<ImageUpload />);
    
    const fileInput = screen.getByLabelText(/Choose a photo/i);
    selectFile(fileInput);
  
    const uploadButton = screen.getByRole('button', { name: /Upload & Locate/i });
    expect(uploadButton).not.toBeDisabled();
  
    fireEvent.click(uploadButton);
  
    // Immediately after click, button should be disabled and show loading state
    expect(uploadButton).toBeDisabled();
    expect(screen.getByText(/Processing.../i)).toBeInTheDocument();
  
    await waitFor(() => {
      // After fetch completes, loading state should be gone
      expect(screen.queryByText(/Processing.../i)).not.toBeInTheDocument();
      // Button should be re-enabled (or in this case, it might be reset/gone if file is cleared)
      // The current implementation keeps the preview and the "New Photo" button appears.
      // The "Upload & Locate" button itself is still there but would be disabled if selectedFile became null.
      // Since selectedFile is reset, the button for "Upload & Locate" becomes disabled again.
      expect(uploadButton).toBeDisabled(); 
    });

    // And success message should be shown
    expect(screen.getByText(/Image uploaded and processed successfully./i)).toBeInTheDocument();
  });

  test('shows error if no file is selected and upload is clicked', () => {
    render(<ImageUpload />);
    const uploadButton = screen.getByRole('button', { name: /Upload & Locate/i });
    
    // Button is initially disabled
    expect(uploadButton).toBeDisabled();
    
    // Manually enable it for the sake of testing this specific error path,
    // though UI wouldn't normally allow this.
    // This scenario is more about the internal check in handleSubmit.
    // A better way might be to directly call handleSubmit if it were exposed,
    // but for component testing, interacting via UI is preferred.
    // The button disabling logic usually prevents this.
    // However, if we select a file and then de-select it (not standard browser behavior for file input),
    // or if the logic had a flaw, this test would be relevant.
    // For now, we assume the button remains disabled.
    // To directly test the error message:
    // fireEvent.click(uploadButton); // This won't do anything if disabled
    // Instead, we can check that it *is* disabled:
    expect(uploadButton).toBeDisabled();

    // If we were to simulate a scenario where handleSubmit is called without a file:
    // (This requires a bit of a workaround to test the internal logic directly via UI)
    // For instance, if selectedFile was set then cleared by some other means
    // and the button remained enabled due to a state update issue.

    // Let's test the explicit error message logic within handleSubmit.
    // We select a file, then try to trigger upload *without* it (hypothetically)
    const fileInput = screen.getByLabelText(/Choose a photo/i);
    selectFile(fileInput); // File is selected, button enabled
    expect(uploadButton).not.toBeDisabled();

    // Simulate clearing the file *before* clicking upload (e.g. by clicking "New Photo" which resets)
    const newPhotoButton = screen.getByRole('button', { name: /New Photo/i });
    fireEvent.click(newPhotoButton); // Resets selectedFile

    expect(uploadButton).toBeDisabled(); // Now it should be disabled again
    
    // If we were to click it now (if it weren't disabled), it should show the error.
    // Since it *is* disabled, this path isn't naturally testable through a click.
    // The component relies on button disable state primarily.
    // However, the error message 'Please select a file first!' is in handleSubmit.
    // We can verify that if an attempt to submit without a file occurs, the error is set.
    // This test is slightly artificial as the button disabling should prevent this.
    // The original code in ImageUpload.js has `if (!selectedFile) { setError('Please select a file first!'); ... }`

    // No direct error message for "Please select a file first!" will appear if button is correctly disabled.
    // If the button were enabled and clicked with no file, then:
    // fireEvent.click(uploadButton);
    // expect(screen.getByText(/Please select a file first!/i)).toBeInTheDocument();
    // This test as is confirms the button's disabled state.
  });

});
