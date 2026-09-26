import { useState, useEffect, useRef } from 'react'
import { X, Users, Trash2, Crown, Plus, Info, Search, ChevronDown, Check, AlertCircle } from 'lucide-react'
import { getUsers } from '../services/authService'
import './ManageMembersModal.css'

function getInitials(name) {
  if (!name) return 'U'
  const parts = name.trim().split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

export default function ManageMembersModal({ project, isOpen, onClose, onUpdateProject }) {
  const [availableUsers, setAvailableUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'success' | 'error', text: '' }
  const [confirmRemoveId, setConfirmRemoveId] = useState(null)
  
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      loadUsers()
      setSelectedUserId('')
      setSearchTerm('')
      setIsDropdownOpen(false)
      setFeedback(null)
      setConfirmRemoveId(null)
    }
  }, [isOpen, project])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const users = await getUsers()
      setAvailableUsers(users || [])
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to load registered users.' })
    } finally {
      setLoadingUsers(false)
    }
  }

  if (!isOpen || !project) return null

  const members = project.members || []
  const ownerId = typeof project.owner === 'object' ? project.owner._id?.toString() : project.owner?.toString()

  // Filter out existing project members
  const unaddedUsers = availableUsers.filter(
    user => !members.some(m => (m._id?.toString() || m.toString()) === user._id?.toString())
  )

  // Filter based on user search term
  const filteredUsers = unaddedUsers.filter(user => {
    const term = searchTerm.toLowerCase()
    return user.name?.toLowerCase().includes(term) || user.email?.toLowerCase().includes(term)
  })

  const selectedUserObj = availableUsers.find(u => u._id === selectedUserId)

  const handleAddMember = async () => {
    if (!selectedUserId) return
    setIsSubmitting(true)
    setFeedback(null)
    try {
      const currentMemberIds = members.map(m => m._id || m)
      const updatedProject = await onUpdateProject(project._id, {
        members: [...currentMemberIds, selectedUserId]
      })
      setSelectedUserId('')
      setSearchTerm('')
      setIsDropdownOpen(false)
      setFeedback({ type: 'success', text: 'Member added successfully!' })
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to add member to project.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveMember = async (memberId) => {
    if (memberId === ownerId) return
    setIsSubmitting(true)
    setFeedback(null)
    setConfirmRemoveId(null)
    try {
      const currentMemberIds = members
        .map(m => m._id || m)
        .filter(id => id.toString() !== memberId.toString())
      await onUpdateProject(project._id, { members: currentMemberIds })
      setFeedback({ type: 'success', text: 'Member removed successfully.' })
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to remove member.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="members-modal-backdrop" role="dialog" aria-modal="true">
      <div className="members-modal-container">
        {/* Header */}
        <div className="members-modal-header">
          <div>
            <span className="members-modal-eyebrow">Project Members</span>
            <h2 className="members-modal-title">Manage Project Members</h2>
            <p className="members-modal-subtitle">
              Add or remove members from this project. Only project members can be assigned to tasks.
            </p>
          </div>
          <button
            type="button"
            className="members-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div className={`members-feedback-banner ${feedback.type}`}>
            {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{feedback.text}</span>
            <button type="button" className="feedback-close-btn" onClick={() => setFeedback(null)}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Current Members Section */}
        <div className="members-section">
          <div className="members-section-header">
            <h3>Current Members ({members.length})</h3>
          </div>

          <div className="members-list-scroll">
            {members.map(member => {
              const mId = member._id?.toString() || member.toString()
              const isOwner = mId === ownerId
              const isConfirmingThis = confirmRemoveId === mId

              return (
                <div key={mId} className="member-card">
                  <div className="member-info">
                    <div className="member-avatar">
                      {getInitials(member.name)}
                    </div>
                    <div className="member-details">
                      <span className="member-name">{member.name}</span>
                      <span className="member-email">{member.email}</span>
                    </div>
                  </div>

                  <div className="member-actions">
                    {isOwner ? (
                      <span className="role-badge owner-badge">
                        <Crown size={12} />
                        Owner
                      </span>
                    ) : (
                      <>
                        <span className="role-badge member-badge">Member</span>
                        {isConfirmingThis ? (
                          <div className="inline-confirm-box">
                            <span className="confirm-text">Remove user?</span>
                            <button
                              type="button"
                              className="confirm-yes-btn"
                              disabled={isSubmitting}
                              onClick={() => handleRemoveMember(mId)}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              className="confirm-no-btn"
                              disabled={isSubmitting}
                              onClick={() => setConfirmRemoveId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="member-remove-btn"
                            title="Remove member"
                            disabled={isSubmitting}
                            onClick={() => setConfirmRemoveId(mId)}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="members-modal-divider" />

        {/* Add New Member Section */}
        <div className="members-section">
          <h3 className="add-member-heading">Add New Member</h3>

          {/* Searchable Select Dropdown */}
          <div className="user-select-wrapper" ref={dropdownRef}>
            <div
              className={`user-select-input-container ${isDropdownOpen ? 'open' : ''}`}
              onClick={() => setIsDropdownOpen(true)}
            >
              <Search size={16} className="search-icon" />
              
              <input
                type="text"
                className="user-select-input"
                placeholder={selectedUserObj ? `${selectedUserObj.name} (${selectedUserObj.email})` : "Search and select a registered user..."}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  if (!isDropdownOpen) setIsDropdownOpen(true)
                }}
                onFocus={() => setIsDropdownOpen(true)}
              />

              {selectedUserObj ? (
                <button
                  type="button"
                  className="clear-select-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedUserId('')
                    setSearchTerm('')
                  }}
                  title="Clear selection"
                >
                  <X size={14} />
                </button>
              ) : (
                <ChevronDown size={16} className={`dropdown-arrow ${isDropdownOpen ? 'rotated' : ''}`} />
              )}
            </div>

            {/* Dropdown Options List */}
            {isDropdownOpen && (
              <div className="user-select-dropdown">
                {loadingUsers ? (
                  <div className="dropdown-loading">Loading registered users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="dropdown-empty">
                    {unaddedUsers.length === 0
                      ? 'All registered users are already members of this project.'
                      : 'No users found matching your search.'}
                  </div>
                ) : (
                  filteredUsers.map(user => {
                    const isSelected = user._id === selectedUserId
                    return (
                      <div
                        key={user._id}
                        className={`dropdown-user-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedUserId(user._id)
                          setSearchTerm('')
                          setIsDropdownOpen(false)
                        }}
                      >
                        <div className="dropdown-user-avatar">
                          {getInitials(user.name)}
                        </div>
                        <div className="dropdown-user-details">
                          <span className="dropdown-user-name">{user.name}</span>
                          <span className="dropdown-user-email">{user.email}</span>
                        </div>
                        {isSelected && <Check size={16} className="selected-check" />}
                      </div>
                    )
                  })
                )}
              </div>
            )}
          </div>

          {/* Informational Message */}
          <div className="members-info-box">
            <Info size={15} />
            <span>Only registered users can be added as project members.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="members-modal-footer">
          <button
            type="button"
            className="members-btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="members-btn-primary"
            disabled={!selectedUserId || isSubmitting}
            onClick={handleAddMember}
          >
            <Plus size={16} />
            {isSubmitting ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  )
}
