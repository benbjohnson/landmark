module ApplicationHelper
  ##############################################################################
  #
  # Methods
  #
  ##############################################################################

  ######################################
  # Current account
  ######################################

  def current_account
    return current_user ? current_user.account : nil
  end

  ######################################
  # Current project
  ######################################

  # Retrieves the current project set on the user's session. If no session is
  # set then the first project on the user's account is used.
  def current_project
    if user_signed_in?
      project = nil
      project = current_account.projects.where(:id => session[:current_project_id]).first unless session[:current_project_id].blank?
      project ||= current_account.projects.first
      set_current_project(project)
      return project
    else
      return nil
    end
  end

  # Sets the current project for the currently logged in user.
  def set_current_project(project)
    session[:current_project_id] = (!project.nil? ? project.id : nil)
  end
end
