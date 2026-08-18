import { AppError } from "@/lib/errors";
import * as taxonomyRepository from "@/features/tasks/repositories/taxonomy.repository";
import type {
  CreateCategoryInput,
  CreateLabelInput,
  CreateTagInput,
  UpdateCategoryInput,
  UpdateLabelInput,
  UpdateTagInput,
} from "@/features/tasks/schemas/taxonomy.schema";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function listCategories(userId: string) {
  return taxonomyRepository.findCategories(userId);
}

export async function createCategory(userId: string, input: CreateCategoryInput) {
  try {
    return await taxonomyRepository.createCategory(userId, input);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw AppError.conflict("A category with this name already exists");
    }
    throw error;
  }
}

export async function updateCategory(userId: string, id: string, input: UpdateCategoryInput) {
  const existing = await taxonomyRepository.findCategoryById(userId, id);

  if (!existing) {
    throw AppError.notFound("Category not found");
  }

  try {
    return await taxonomyRepository.updateCategory(id, input);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw AppError.conflict("A category with this name already exists");
    }
    throw error;
  }
}

export async function deleteCategory(userId: string, id: string) {
  const existing = await taxonomyRepository.findCategoryById(userId, id);

  if (!existing) {
    throw AppError.notFound("Category not found");
  }

  await taxonomyRepository.deleteCategory(id);
}

export async function listLabels(userId: string) {
  return taxonomyRepository.findLabels(userId);
}

export async function createLabel(userId: string, input: CreateLabelInput) {
  try {
    return await taxonomyRepository.createLabel(userId, input);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw AppError.conflict("A label with this name already exists");
    }
    throw error;
  }
}

export async function updateLabel(userId: string, id: string, input: UpdateLabelInput) {
  const existing = await taxonomyRepository.findLabelById(userId, id);

  if (!existing) {
    throw AppError.notFound("Label not found");
  }

  try {
    return await taxonomyRepository.updateLabel(id, input);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw AppError.conflict("A label with this name already exists");
    }
    throw error;
  }
}

export async function deleteLabel(userId: string, id: string) {
  const existing = await taxonomyRepository.findLabelById(userId, id);

  if (!existing) {
    throw AppError.notFound("Label not found");
  }

  await taxonomyRepository.deleteLabel(id);
}

export async function listTags(userId: string) {
  return taxonomyRepository.findTags(userId);
}

export async function createTag(userId: string, input: CreateTagInput) {
  const existing = await taxonomyRepository.findTagByName(userId, input.name);

  if (existing) {
    throw AppError.conflict("A tag with this name already exists");
  }

  return taxonomyRepository.createTag(userId, input);
}

export async function updateTag(userId: string, id: string, input: UpdateTagInput) {
  const existing = await taxonomyRepository.findTagById(userId, id);

  if (!existing) {
    throw AppError.notFound("Tag not found");
  }

  try {
    return await taxonomyRepository.updateTag(id, input);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw AppError.conflict("A tag with this name already exists");
    }
    throw error;
  }
}

export async function deleteTag(userId: string, id: string) {
  const existing = await taxonomyRepository.findTagById(userId, id);

  if (!existing) {
    throw AppError.notFound("Tag not found");
  }

  await taxonomyRepository.deleteTag(id);
}