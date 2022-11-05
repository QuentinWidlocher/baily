import { createForm, createFormAction } from 'remix-forms'
import { Form as FrameworkForm, useActionData, useSubmit, useTransition as useNavigation } from '@remix-run/react'
import { redirect, superjson as json } from './superjson'

export const Form = createForm({ component: FrameworkForm, useNavigation, useSubmit, useActionData })

export const formAction = createFormAction({ redirect, json })