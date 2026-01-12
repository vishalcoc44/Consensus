import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Clock, Flag, CheckCircle, Circle, MoreVertical, Trash2, Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTeam } from '@/contexts/TeamContext';
import { useToast } from '@/hooks/use-toast';
import { fetchEvents, createEvent, deleteEvent } from '@/services/calendarService';
import type { DecisionEvent, NewDecisionEvent } from '@/types/phase3';
import { format, isSameDay, startOfMonth, endOfMonth, isFuture, isToday, addMonths, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import ShimmerText from '@/components/ui/effects/ShimmerText';

const DecisionCalendar = () => {
	const [events, setEvents] = useState<DecisionEvent[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedDate, setSelectedDate] = useState<Date>(new Date());
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [showEventModal, setShowEventModal] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const { currentTeam } = useTeam();
	const { toast } = useToast();

	const [newEvent, setNewEvent] = useState<{
		title: string;
		description: string;
		event_date: string;
		event_type: 'deadline' | 'milestone' | 'review';
	}>({
		title: '',
		description: '',
		event_date: '',
		event_type: 'milestone',
	});

	useEffect(() => {
		if (!currentTeam) {
			setLoading(false);
			return;
		}
		loadEvents();
	}, [currentTeam]);

	const loadEvents = async () => {
		if (!currentTeam) return;

		try {
			const data = await fetchEvents(currentTeam.id);
			setEvents(data);
		} catch (error) {
			console.error('Failed to load events:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSubmitEvent = async () => {
		if (!currentTeam || !newEvent.title.trim() || !newEvent.event_date) {
			toast({
				title: 'Error',
				description: 'Please fill in required fields (title and date)',
				variant: 'destructive',
			});
			return;
		}

		setSubmitting(true);
		try {
			const eventData: NewDecisionEvent = {
				team_id: currentTeam.id,
				proposal_id: null,
				title: newEvent.title.trim(),
				description: newEvent.description.trim() || null,
				event_date: new Date(newEvent.event_date).toISOString(),
				event_type: newEvent.event_type,
				is_completed: false,
				created_by: null,
			};

			const created = await createEvent(eventData);
			setEvents([...events, created]);
			setShowEventModal(false);
			setNewEvent({
				title: '',
				description: '',
				event_date: '',
				event_type: 'milestone',
			});
			toast({ title: 'Event created successfully' });
		} catch (error) {
			console.error('Failed to create event:', error);
			toast({
				title: 'Error',
				description: 'Failed to create event',
				variant: 'destructive',
			});
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteEvent = async (eventId: string) => {
		try {
			await deleteEvent(eventId);
			setEvents(events.filter(e => e.id !== eventId));
			toast({ title: 'Event deleted' });
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to delete event',
				variant: 'destructive',
			});
		}
	};

	const getEventTypeConfig = (type: string) => {
		switch (type) {
			case 'deadline':
				return {
					icon: Clock,
					gradient: 'from-rose-500 to-red-600',
					badge: 'Deadline',
					text: 'text-rose-600 dark:text-rose-400',
					bg: 'bg-rose-500/10',
					border: 'border-rose-500/20'
				};
			case 'milestone':
				return {
					icon: Flag,
					gradient: 'from-violet-500 to-purple-600',
					badge: 'Milestone',
					text: 'text-violet-600 dark:text-violet-400',
					bg: 'bg-violet-500/10',
					border: 'border-violet-500/20'
				};
			case 'review':
				return {
					icon: CheckCircle,
					gradient: 'from-emerald-500 to-teal-600',
					badge: 'Review',
					text: 'text-emerald-600 dark:text-emerald-400',
					bg: 'bg-emerald-500/10',
					border: 'border-emerald-500/20'
				};
			default:
				return {
					icon: CalendarDays,
					gradient: 'from-sky-500 to-blue-600',
					badge: 'Event',
					text: 'text-sky-600 dark:text-sky-400',
					bg: 'bg-sky-500/10',
					border: 'border-sky-500/20'
				};
		}
	};

	const eventsForSelectedDate = events.filter(event =>
		isSameDay(new Date(event.event_date), selectedDate)
	);

	const upcomingEvents = events
		.filter(event => isFuture(new Date(event.event_date)) && !event.is_completed)
		.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
		.slice(0, 5);

	const eventDates = events.map(event => new Date(event.event_date));

	const stats = useMemo(() => ({
		total: events.length,
		upcoming: events.filter(e => isFuture(new Date(e.event_date))).length,
		completed: events.filter(e => e.is_completed).length,
		thisMonth: events.filter(e => {
			const eventDate = new Date(e.event_date);
			return eventDate >= startOfMonth(currentMonth) && eventDate <= endOfMonth(currentMonth);
		}).length,
	}), [events, currentMonth]);

	// If not loading and no team selected, show empty state
	if (!loading && !currentTeam) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh]">
				<div className="p-6 rounded-full bg-muted mb-6">
					<Calendar className="h-12 w-12 text-muted-foreground" />
				</div>
				<h3 className="text-xl font-semibold mb-2">No team selected</h3>
				<p className="text-muted-foreground">Please select a team to view the decision calendar</p>
			</div>
		);
	}

	return (
		<div className="space-y-6 animate-in fade-in duration-500 pb-10">
			{/* Header Section */}
			<div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
				<div className="space-y-1">
					<h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
						<CalendarDays className="h-8 w-8 text-primary" />
						<ShimmerText className="inline-block">Decision Calendar</ShimmerText>
					</h1>
					<p className="text-muted-foreground text-lg font-light">
						Orchestrate your team's timeline and key milestones
					</p>
				</div>
				<Button
					onClick={() => setShowEventModal(true)}
					className="rounded-full px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25 transition-all duration-300 hover:scale-105"
				>
					<Plus className="h-5 w-5 mr-2" />
					New Event
				</Button>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
				{[
					{ label: 'Total Events', value: stats.total, icon: CalendarDays, color: 'text-violet-500', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
					{ label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
					{ label: 'This Month', value: stats.thisMonth, icon: Flag, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
					{ label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
				].map((stat, index) => (
					<div
						key={index}
						className={cn(
							"group relative overflow-hidden rounded-2xl border bg-white/50 dark:bg-black/20 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
							stat.border
						)}
					>
						<div className={cn("absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent to-white/5", stat.bg)} />
						<div className="relative p-6">
							<div className="flex items-center justify-between mb-4">
								<div className={cn("p-2.5 rounded-xl", stat.bg)}>
									<stat.icon className={cn("h-5 w-5", stat.color)} />
								</div>
								<Sparkles className={cn("h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300", stat.color)} />
							</div>
							<div>
								<p className="text-3xl font-bold tracking-tight">{stat.value}</p>
								<p className="text-sm font-medium text-muted-foreground mt-1">{stat.label}</p>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Main Content Area */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Calendar Section */}
				<div className="lg:col-span-8 space-y-6">
					<Card className="border-0 shadow-xl bg-white/80 dark:bg-black/40 backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
						<CardHeader className="border-b border-border/50 pb-4">
							<div className="flex items-center justify-between">
								<div className="space-y-1">
									<CardTitle className="text-2xl font-semibold">
										{format(currentMonth, 'MMMM yyyy')}
									</CardTitle>
									<CardDescription>
										Manage your schedule
									</CardDescription>
								</div>
								<div className="flex items-center bg-muted/50 rounded-lg p-1">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
										className="h-8 w-8 hover:bg-background rounded-md transition-all"
									>
										<ChevronLeft className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setCurrentMonth(new Date())}
										className="h-8 px-4 text-xs font-medium hover:bg-background rounded-md transition-all"
									>
										Today
									</Button>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
										className="h-8 w-8 hover:bg-background rounded-md transition-all"
									>
										<ChevronRight className="h-4 w-4" />
									</Button>
								</div>
							</div>
						</CardHeader>
						<CardContent className="p-6">
							<Calendar
								mode="single"
								selected={selectedDate}
								onSelect={(date) => date && setSelectedDate(date)}
								month={currentMonth}
								onMonthChange={setCurrentMonth}
								className="w-full"
								modifiers={{
									hasEvent: eventDates,
								}}
								modifiersClassNames={{
									hasEvent: '',
								}}
								components={{
									DayContent: (props) => {
										const hasEvent = eventDates.some(d => isSameDay(d, props.date));
										return (
											<div className="relative w-full h-full flex items-center justify-center">
												{props.date.getDate()}
												{hasEvent && (
													<div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-500 ring-2 ring-background" />
												)}
											</div>
										);
									}
								}}
								classNames={{
									months: "w-full",
									month: "w-full space-y-4",
									caption: "hidden",
									table: "w-full border-collapse",
									head_row: "flex w-full mb-4",
									head_cell: "text-muted-foreground w-full font-medium text-xs uppercase tracking-wider",
									row: "flex w-full mt-2",
									cell: cn(
										"relative h-14 w-full text-center text-sm p-0 focus-within:relative focus-within:z-20",
										"first:[&:has([aria-selected])]:rounded-l-2xl last:[&:has([aria-selected])]:rounded-r-2xl"
									),
									day: cn(
										"h-14 w-14 p-0 font-normal aria-selected:opacity-100 rounded-2xl transition-all duration-300 mx-auto",
										"hover:bg-violet-500/10 hover:scale-105 hover:text-violet-600",
										"focus:bg-violet-500/10 focus:text-violet-600"
									),
									day_selected: "bg-violet-600 text-white hover:bg-violet-700 hover:text-white focus:bg-violet-700 focus:text-white shadow-lg shadow-violet-500/30 scale-105",
									day_today: "bg-muted text-foreground font-semibold ring-1 ring-border",
									day_outside: "text-muted-foreground opacity-30",
									day_disabled: "text-muted-foreground opacity-30",
									day_hidden: "invisible",
								}}
							/>
						</CardContent>
					</Card>
				</div>

				{/* Sidebar Section */}
				<div className="lg:col-span-4 space-y-6">
					{/* Selected Date Details */}
					<div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-black/5 dark:border-white/10 shadow-xl overflow-hidden h-full flex flex-col">
						<div className="p-6 border-b border-border/50 bg-gradient-to-b from-muted/30 to-transparent">
							<div className="flex items-center justify-between mb-1">
								<h2 className="text-lg font-semibold flex items-center gap-2">
									<span className={cn(
										"inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm font-bold shadow-sm",
										isToday(selectedDate)
											? "bg-violet-600 text-white"
											: "bg-white dark:bg-black/40 border"
									)}>
										{format(selectedDate, 'd')}
									</span>
									{format(selectedDate, 'EEEE')}
								</h2>
								<Badge variant="outline" className="font-normal">
									{eventsForSelectedDate.length} Events
								</Badge>
							</div>
							<p className="text-sm text-muted-foreground pl-10">
								{format(selectedDate, 'MMMM yyyy')}
							</p>
						</div>

						<div className="flex-1 p-4 overflow-y-auto min-h-[300px] space-y-3">
							{loading ? (
								<>
									<Skeleton className="h-20 w-full rounded-xl" />
									<Skeleton className="h-20 w-full rounded-xl" />
								</>
							) : eventsForSelectedDate.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-3">
									<div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
										<CalendarDays className="h-8 w-8 text-muted-foreground/50" />
									</div>
									<div>
										<p className="font-medium text-foreground">No events planned</p>
										<p className="text-sm text-muted-foreground">Tap "New Event" to add one</p>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => setShowEventModal(true)}
										className="mt-2 rounded-full"
									>
										Add Event
									</Button>
								</div>
							) : (
								eventsForSelectedDate.map((event, i) => {
									const config = getEventTypeConfig(event.event_type);
									const Icon = config.icon;

									return (
										<div
											key={event.id}
											className="group relative flex items-start gap-4 p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-transparent hover:border-violet-500/20 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 animate-in slide-in-from-bottom-2"
											style={{ animationDelay: `${i * 100}ms` }}
										>
											<div className={cn(
												"p-2.5 rounded-xl shadow-sm shrink-0",
												config.bg,
												config.text
											)}>
												<Icon className="h-5 w-5" />
											</div>
											<div className="flex-1 min-w-0 pt-0.5">
												<div className="flex items-center justify-between gap-2">
													<p className="font-semibold text-sm truncate">{event.title}</p>
												</div>
												<div className="flex items-center gap-2 mt-1">
													<Badge variant="secondary" className={cn("text-[10px] h-5 px-1.5 font-medium border-0", config.bg, config.text)}>
														{config.badge}
													</Badge>
													<span className="text-xs text-muted-foreground">
														{format(new Date(event.event_date), 'h:mm a')}
													</span>
												</div>
											</div>
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2"
													>
														<MoreVertical className="h-4 w-4" />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem
														onClick={() => handleDeleteEvent(event.id)}
														className="text-destructive focus:text-destructive"
													>
														<Trash2 className="h-4 w-4 mr-2" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</div>
									);
								})
							)}
						</div>
					</div>

					{/* Upcoming Preview */}
					<div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
								<Sparkles className="h-5 w-5 text-white" />
							</div>
							<div>
								<h3 className="font-semibold">Coming Up</h3>
								<p className="text-xs text-white/70">Next 5 scheduled events</p>
							</div>
						</div>

						<div className="space-y-3">
							{upcomingEvents.length === 0 ? (
								<p className="text-sm text-white/60 text-center py-4">No upcoming events found</p>
							) : (
								upcomingEvents.map((event) => (
									<div
										key={event.id}
										onClick={() => {
											setSelectedDate(new Date(event.event_date));
											setCurrentMonth(new Date(event.event_date));
										}}
										className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 hover:scale-[1.02] transition-all cursor-pointer border border-white/10"
									>
										<div className="min-w-0">
											<p className="font-medium text-sm truncate">{event.title}</p>
											<p className="text-xs text-white/60 mt-0.5">
												{format(new Date(event.event_date), 'MMM d')} • {format(new Date(event.event_date), 'h:mm a')}
											</p>
										</div>
										<div className="h-2 w-2 rounded-full bg-white/40" />
									</div>
								))
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Create Event Modal */}
			<Dialog open={showEventModal} onOpenChange={setShowEventModal}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Create Event</DialogTitle>
						<DialogDescription>
							Add a new deadline, milestone, or review to your calendar
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="title" className="text-xs font-medium uppercase text-muted-foreground">Event Title</Label>
							<Input
								id="title"
								value={newEvent.title}
								onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
								placeholder="e.g., Q3 Strategy Review"
								className="rounded-xl border-border/50 bg-muted/50 focus:bg-background transition-colors"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="description" className="text-xs font-medium uppercase text-muted-foreground">Description</Label>
							<Textarea
								id="description"
								value={newEvent.description}
								onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
								placeholder="Add details..."
								className="rounded-xl resize-none border-border/50 bg-muted/50 focus:bg-background transition-colors"
								rows={3}
							/>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="date" className="text-xs font-medium uppercase text-muted-foreground">Date & Time</Label>
								<Input
									id="date"
									type="datetime-local"
									value={newEvent.event_date}
									onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
									className="rounded-xl border-border/50 bg-muted/50 focus:bg-background transition-colors"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="type" className="text-xs font-medium uppercase text-muted-foreground">Type</Label>
								<Select
									value={newEvent.event_type}
									onValueChange={(value: 'deadline' | 'milestone' | 'review') =>
										setNewEvent({ ...newEvent, event_type: value })
									}
								>
									<SelectTrigger className="rounded-xl border-border/50 bg-muted/50 focus:bg-background transition-colors">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="deadline">
											<span className="flex items-center gap-2">
												<Clock className="h-4 w-4 text-rose-500" />
												Deadline
											</span>
										</SelectItem>
										<SelectItem value="milestone">
											<span className="flex items-center gap-2">
												<Flag className="h-4 w-4 text-violet-500" />
												Milestone
											</span>
										</SelectItem>
										<SelectItem value="review">
											<span className="flex items-center gap-2">
												<CheckCircle className="h-4 w-4 text-emerald-500" />
												Review
											</span>
										</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button variant="ghost" onClick={() => setShowEventModal(false)} className="rounded-xl hover:bg-muted/50">
							Cancel
						</Button>
						<Button
							onClick={handleSubmitEvent}
							disabled={submitting}
							className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25"
						>
							{submitting ? 'Creating...' : 'Create Event'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default DecisionCalendar;
