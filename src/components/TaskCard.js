import React from 'react';
import './TaskCard.css';
import Backlog from '../assets/Backlog.svg';
import InProgress from '../assets/in-progress.svg';
import Done from '../assets/Done.svg';
import Cancelled from '../assets/Cancelled.svg';
import TodoIcon from '../assets/To-do.svg';
import NoPriority from '../assets/No-priority.svg';
import HighPriority from '../assets/Img - High Priority.svg';
import MediumPriority from '../assets/Img - Medium Priority.svg';
import LowPriority from '../assets/Img - Low Priority.svg';
import UrgentPriority from '../assets/SVG - Urgent Priority colour.svg';

const TaskCard = ({ task, userName, grouping, available }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'Backlog':
                return Backlog;
            case 'In progress':
                return InProgress;
            case 'Done':
                return Done;
            case 'Cancelled':
                return Cancelled;
            default:
                return TodoIcon;
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 4:
                return HighPriority;
            case 3:
                return MediumPriority;
            case 2:
                return LowPriority;
            case 1:
                return UrgentPriority;
            default:
                return NoPriority;
        }
    };

    const getAvatarColor = (initial) => {
        const colors = {
            'A': '#8E44AD', // Purple
            'Y': '#F39C12', // Orange
            'S': '#2ECC71', // Green
            'R': '#E74C3C', // Red
            'M': '#3498DB', // Blue
            'U': '#95A5A6'  // Gray (for unassigned)
        };
        return colors[initial] || '#34495E'; // Default dark blue
    };

    const getUserInitials = (name) => {
        if (!name) return 'U';
        const nameParts = name.split(' ');
        if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    };

    const userInitials = getUserInitials(userName);
    const avatarColor = getAvatarColor(userInitials.charAt(0));

    return (
        <div className="task-card">
            <div className="card-top">
                <p className="task-id">{task.id}</p>
                {grouping !== 'userId' && (
                    <div className="user-avatar" style={{ backgroundColor: avatarColor }}>
                        {userInitials}
                        <div className={`availability-indicator ${available ? 'available' : 'unavailable'}`}></div>
                    </div>
                )}
            </div>
            <div className="card-content">
                {grouping !== 'status' && (
                    <img src={getStatusIcon(task.status)} alt={task.status} className="status-icon" />
                )}
                <h3 className="task-title" title={task.title}>{task.title}</h3>
            </div>
            <div className="card-footer">
                {grouping !== 'priority' && (
                    <img src={getPriorityIcon(task.priority)} alt={`Priority ${task.priority}`} className="priority-icon" />
                )}
                <div className="tag-container">
                    <div className="tag-circle"></div>
                    <div className="tag">{task.tag.join(', ')}</div>
                </div>
            </div>
        </div>
    );
};

export default TaskCard;
