import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Define validation schema
const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Email must be a valid email').required('Email is required'),
});

const ExampleForm = ({ initialData, onSubmit }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: initialData,
    resolver: yupResolver(schema),
  });

  // Handle form submission
  const submitHandler = (data) => {
    onSubmit(data); // Call the onSubmit prop to update data
  };

  // Reset the form fields to the initial data
  const cancelHandler = () => {
    reset(initialData); // Resets form to initialData
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)}>
      <div>
        <label>Name</label>
        <input {...register('name')} />
        {errors.name && <p>{errors.name.message as string}</p>}
      </div>

      <div>
        <label>Email</label>
        <input {...register('email')} />
        {errors.email && <p>{errors.email.message as string}</p>}
      </div>

      <button type="submit">Submit</button>
      <button type="button" onClick={cancelHandler} disabled={!isDirty}>
        Cancel
      </button>
    </form>
  );
};

export default ExampleForm;
