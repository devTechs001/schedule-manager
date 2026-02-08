import { useState } from 'react';
import { FaFolder, FaPlus, FaSearch, FaFilter, FaEllipsisV, FaUsers, FaTasks, FaCalendarAlt } from 'react-icons/fa';

const Projects = () => {
  const [view, setView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);

  const projects = [
    { id: 1, name: 'Website Redesign', status: 'active', progress: 75, tasks: 24, completed: 18, members: 5, dueDate: '2024-03-15', color: 'blue' },
    { id: 2, name: 'Mobile App Development', status: 'active', progress: 45, tasks: 56, completed: 25, members: 8, dueDate: '2024-04-01', color: 'purple' },
    { id: 3, name: 'Marketing Campaign', status: 'on-hold', progress: 30, tasks: 12, completed: 4, members: 3, dueDate: '2024-02-28', color: 'green' },
    { id: 4, name: 'API Integration', status: 'active', progress: 90, tasks: 18, completed: 16, members: 4, dueDate: '2024-02-20', color: 'orange' },
    { id: 5, name: 'User Research', status: 'completed', progress: 100, tasks: 8, completed: 8, members: 2, dueDate: '2024-01-15', color: 'teal' },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      'on-hold': 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
      completed: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
    };
    return styles[status] || styles.active;
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400">{projects.length} projects total</p>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
        >
          <FaPlus className="mr-2" /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
          />
        </div>
        <button className="flex items-center px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
          <FaFilter className="mr-2" /> Filter
        </button>
        <div className="flex border dark:border-gray-600 rounded-lg overflow-hidden">
          <button
            onClick={() => setView('grid')}
            className={`px-4 py-2 ${view === 'grid' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
          >
            List
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 bg-${project.color}-100 dark:bg-${project.color}-900/30 rounded-lg flex items-center justify-center`}>
                  <FaFolder className={`text-${project.color}-500`} />
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <FaEllipsisV />
                </button>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{project.name}</h3>
              
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(project.status)}`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>

              {/* Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Progress</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{project.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${project.color}-500 rounded-full transition-all`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <FaTasks className="mr-1" />
                  {project.completed}/{project.tasks}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <FaUsers className="mr-1" />
                  {project.members}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <FaCalendarAlt className="mr-1" />
                  {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects List */}
      {view === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tasks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FaFolder className={`text-${project.color}-500 mr-3`} />
                      <span className="font-medium text-gray-800 dark:text-white">{project.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(project.status)}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-32">
                      <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                        <div className={`h-full bg-${project.color}-500 rounded-full`} style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{project.completed}/{project.tasks}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{project.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Projects;

