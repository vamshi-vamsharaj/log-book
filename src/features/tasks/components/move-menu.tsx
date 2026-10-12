"use client";

import { ArrowRightLeft, MoreHorizontal, Split, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PLANNING_LEVELS, levelLabel, currentPeriodKey, localDateKey, type PlanningLevel } from "@/lib/period";
import { useMoveTask } from "@/features/tasks/hooks/use-planner-tasks";

interface MoveMenuProps {
  taskId: string;
  currentLevel: PlanningLevel;
  onBreakDown: () => void;
  onDelete: () => void;
}

/** "Move" relocates the same task record to a different level/period in
 * place — no duplication. This intentionally defaults each target level to
 * *its current period* (e.g. "this week", "this month") rather than asking
 * the user to type a period key by hand. */
export function MoveMenu({ taskId, currentLevel, onBreakDown, onDelete }: MoveMenuProps) {
  const moveTask = useMoveTask();
  const [open, setOpen] = useState(false);
  const today = localDateKey();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="More actions"
          className="h-7 w-7 opacity-0 transition-opacity group-hover/row:opacity-100 data-[state=open]:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Move to</div>
        {PLANNING_LEVELS.filter((level) => level !== currentLevel).map((level) => (
          <DropdownMenuItem
            key={level}
            onClick={() =>
              moveTask.mutate({ id: taskId, level, periodKey: currentPeriodKey(level, today) })
            }
          >
            <ArrowRightLeft className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            {levelLabel(level)}
            <span className="ml-1 text-xs text-muted-foreground">(current)</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onBreakDown}>
          <Split className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
          Break down into smaller tasks
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
