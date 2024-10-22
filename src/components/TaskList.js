import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import TaskCard from './TaskCard';
import './TaskList.css';
import DisplayIcon from '../assets/Display.svg';
import PlusIcon from '../assets/add.svg';
import ThreeDotMenu from '../assets/3 dot menu.svg';
import TodoIcon from '../assets/To-do.svg';
import InProgressIcon from '../assets/in-progress.svg';
import DoneIcon from '../assets/Done.svg';
import BacklogIcon from '../assets/Backlog.svg';
import CancelledIcon from '../assets/Cancelled.svg';
import NoPriority from '../assets/No-priority.svg';
import LowPriority from '../assets/Img - Low Priority.svg';
import MediumPriority from '../assets/Img - Medium Priority.svg';
import HighPriority from '../assets/Img - High Priority.svg';
import UrgentPriority from '../assets/SVG - Urgent Priority colour.svg';
import DownArrowIcon from '../assets/down.svg'; // Updated icon import

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [grouping, setGrouping] = useState(() => localStorage.getItem('grouping') || 'status');
    const [ordering, setOrdering] = useState(() => localStorage.getItem('ordering') || 'priority');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dropdownRef = useRef();

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get('https://api.quicksell.co/v1/internal/frontend-assignment');
                setTasks(response.data.tickets);
            } catch (error) {
                setError('Failed to fetch tasks');
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, []);

    // Close the dropdown when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem('grouping', grouping);
    }, [grouping]);

    useEffect(() => {
        localStorage.setItem('ordering', ordering);
    }, [ordering]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    const statusIcons = {
        Todo: TodoIcon,
        'In progress': InProgressIcon,
        Done: DoneIcon,
        Backlog: BacklogIcon,
        Cancelled: CancelledIcon,
    };

    // Define the statuses in the desired order
    const predefinedStatuses = ['Backlog', 'Todo', 'In progress', 'Done', 'Cancelled'];

    // Map userId to user names for better readability
    const userMap = {
        'usr-1': { name: 'Anoop Sharma', available: true },
        'usr-2': { name: 'Yogesh', available: false },
        'usr-3': { name: 'Shankar Kumar', available: true },
        'usr-4': { name: 'Ramesh', available: true },
        'usr-5': { name: 'Suresh', available: false },
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

    const priorityIcons = {
        'No Priority': NoPriority,
        'Low': LowPriority,
        'Medium': MediumPriority,
        'High': HighPriority,
        'Urgent': UrgentPriority,
    };

    const priorityNames = {
        0: 'No Priority',
        1: 'Low',
        2: 'Medium',
        3: 'High',
        4: 'Urgent',
    };

    // Group tasks based on selected grouping method
    const groupedTasks = tasks.reduce((acc, task) => {
        let key;
        switch (grouping) {
            case 'userId':
                key = task.userId; // Use userId as the key
                break;
            case 'priority':
                key = priorityNames[task.priority];
                break;
            default:
                key = task.status;
                break;
        }

        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(task);
        return acc;
    }, {});

    // Ensure all predefined statuses are included if grouping by status
    if (grouping === 'status') {
        predefinedStatuses.forEach((status) => {
            if (!groupedTasks[status]) {
                groupedTasks[status] = [];
            }
        });
    }

    // Sort tasks within each group
    Object.keys(groupedTasks).forEach((group) => {
        groupedTasks[group].sort((a, b) => {
            if (ordering === 'priority') {
                return a.priority - b.priority;
            }
            return a.title.localeCompare(b.title);
        });
    });

    // Render columns based on the selected grouping
    const renderColumns = () => {
        if (grouping === 'priority') {
            return Object.keys(priorityNames)
                .sort((a, b) => b - a)
                .map((priority) => {
                    const priorityName = priorityNames[priority];
                    return (
                        <div className="column" key={priorityName}>
                            <div className="column-header">
                                <img src={priorityIcons[priorityName]} alt={priorityName} className="priority-icon" />
                                <h2>{priorityName}</h2>
                                <span className="count">{(groupedTasks[priorityName] || []).length}</span>
                                <div className="header-right">
                                    <img src={PlusIcon} alt="Add" className="icon" />
                                    <img src={ThreeDotMenu} alt="Menu" className="icon" />
                                </div>
                            </div>
                            <div className="task-list-cards">
                                {(groupedTasks[priorityName] || []).map((task) => (
                                    <TaskCard 
                                        key={task.id} 
                                        task={task} 
                                        userName={userMap[task.userId].name} 
                                        grouping={grouping}
                                        available={userMap[task.userId].available}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                });
        }

        return Object.keys(groupedTasks).map((group) => (
            <div className="column" key={group}>
                <div className="column-header">
                    {grouping === 'status' && statusIcons[group] && (
                        <img src={statusIcons[group]} alt={group} className="status-icon" />
                    )}
                    {grouping === 'userId' && (
                        <div 
                            className="user-avatar" 
                            style={{ backgroundColor: getAvatarColor(getUserInitials(userMap[group].name).charAt(0)) }}
                        >
                            {getUserInitials(userMap[group].name)}
                            <div className={`availability-indicator ${userMap[group].available ? 'available' : 'unavailable'}`}></div>
                        </div>
                    )}
                    <h2>{grouping === 'userId' ? userMap[group].name : group}</h2>
                    <span className="count">{groupedTasks[group].length}</span>
                    <div className="header-right">
                        <img src={PlusIcon} alt="Add" className="icon" />
                        <img src={ThreeDotMenu} alt="Menu" className="icon" />
                    </div>
                </div>
                <div className="task-list-cards">
                    {groupedTasks[group].map((task) => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            userName={userMap[task.userId].name} 
                            grouping={grouping}
                            available={userMap[task.userId].available}
                        />
                    ))}
                </div>
            </div>
        ));
    };

    const handleGroupingChange = (e) => {
        const newGrouping = e.target.value;
        setGrouping(newGrouping);
        localStorage.setItem('grouping', newGrouping);
    };

    const handleOrderingChange = (e) => {
        const newOrdering = e.target.value;
        setOrdering(newOrdering);
        localStorage.setItem('ordering', newOrdering);
    };

    return (
        <div className="task-list">
            <div className="task-list-header">
                <div className="display-dropdown" onClick={() => setDropdownOpen(!dropdownOpen)} ref={dropdownRef}>
                    <img src={DisplayIcon} alt="Display" className="display-icon" />
                    <span>Display</span>
                    <img src={DownArrowIcon} alt="Expand" className="down-arrow-icon" />
                    {dropdownOpen && (
                        <div className="dropdown-content" onClick={(e) => e.stopPropagation()}>
                            <label>
                                <span>Grouping:</span>
                                <select 
                                    value={grouping} 
                                    onChange={handleGroupingChange}
                                >
                                    <option value="status">Status</option>
                                    <option value="userId">User</option>
                                    <option value="priority">Priority</option>
                                </select>
                            </label>
                            <label>
                                <span>Ordering:</span>
                                <select 
                                    value={ordering} 
                                    onChange={handleOrderingChange}
                                >
                                    <option value="priority">Priority</option>
                                    <option value="title">Title</option>
                                </select>
                            </label>
                        </div>
                    )}
                </div>
                <h1>Quick Sell</h1>
                <div className="user-info">Dev Tiwari(21BIT0290)</div>
            </div>
            <div className="columns">
                {renderColumns()}
            </div>
        </div>
    );
};

export default TaskList;
