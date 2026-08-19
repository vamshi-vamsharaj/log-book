import { db } from "@/lib/db";
import type {
  CreateCategoryInput,
  CreateLabelInput,
  CreateTagInput,
  UpdateCategoryInput,
  UpdateLabelInput,
  UpdateTagInput,
} from "@/features/tasks/schemas/taxonomy.schema";

export async function findCategories(userId: string) {
  return db.category.findMany({ where: { userId }, orderBy: { name: "asc" } });
}

export async function findCategoryById(userId: string, id: string) {
  return db.category.findFirst({ where: { id, userId } });
}

export async function createCategory(userId: string, data: CreateCategoryInput) {
  return db.category.create({ data: { ...data, userId } });
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  return db.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return db.category.delete({ where: { id } });
}

export async function findLabels(userId: string) {
  return db.label.findMany({ where: { userId }, orderBy: { name: "asc" } });
}

export async function findLabelById(userId: string, id: string) {
  return db.label.findFirst({ where: { id, userId } });
}

export async function createLabel(userId: string, data: CreateLabelInput) {
  return db.label.create({ data: { ...data, userId } });
}

export async function updateLabel(id: string, data: UpdateLabelInput) {
  return db.label.update({ where: { id }, data });
}

export async function deleteLabel(id: string) {
  return db.label.delete({ where: { id } });
}

export async function findTags(userId: string) {
  return db.tag.findMany({ where: { userId }, orderBy: { name: "asc" } });
}

export async function findTagById(userId: string, id: string) {
  return db.tag.findFirst({ where: { id, userId } });
}

export async function findTagByName(userId: string, name: string) {
  return db.tag.findFirst({ where: { userId, name } });
}

export async function createTag(userId: string, data: CreateTagInput) {
  return db.tag.create({ data: { ...data, userId } });
}

export async function updateTag(id: string, data: UpdateTagInput) {
  return db.tag.update({ where: { id }, data });
}

export async function deleteTag(id: string) {
  return db.tag.delete({ where: { id } });
}