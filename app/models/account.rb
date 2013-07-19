class Account < ActiveRecord::Base
  has_many :users, :dependent => :destroy
  has_many :projects, :dependent => :destroy
  accepts_nested_attributes_for :users
  attr_accessible :name, :users_attributes

  after_create :after_create
  after_commit :after_commit_create, :on => :create

  ##############################################################################
  #
  # Methods
  #
  ##############################################################################

  ######################################
  # Callbacks
  ######################################

  # Creates a default project after an account is created unless a project was
  # already created.
  def after_create
    projects.create!(:name => 'Default') if projects.count == 0
  end

  def after_commit_create
    AccountMailer.sign_up(self).deliver
  end
end