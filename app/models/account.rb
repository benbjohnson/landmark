class Account < ActiveRecord::Base
  has_many :users, :dependent => :destroy
  has_many :actions
  accepts_nested_attributes_for :users
  validates :name, :presence => true  
  before_create :before_create
  after_create :after_create

  attr_accessible :name, :users_attributes

  ##############################################################################
  #
  # Methds
  #
  ##############################################################################

  ######################################
  # Callbacks
  ######################################

  # Generate the API key and check if Sky is running.
  def before_create
    self.generate_api_key

    if !Rails.env.test?
      self.errors.add("Unable to connect to tracking server") if !sky_client.ping
    end
  end

  # Creates a tracking table in Sky that is associated with this account.
  def after_create
    if !Rails.env.test?
      @sky_table = sky_client.create_table(:name => sky_table_name)
      @sky_table.create_property(:name => 'action', :transient => true, :data_type => 'factor')
    end
  end


  ######################################
  # API
  ######################################

  # Generates an API key for the account.
  def generate_api_key
    self.api_key = SecureRandom.hex(16)
  end


  ######################################
  # Tracking
  ######################################

  # The client used to connect to Sky.
  def sky_client
    return SkyDB::Client.new(:host => 'localhost', :port => 8585)
  end

  # Tracks an event for the account.
  def sky_table
    return nil if self.new_record?
    @sky_table ||= SkyDB::Table.new(:name => self.sky_table_name, :client => sky_client)
  end

  # The name of the associated Sky table.
  def sky_table_name
    return self.new_record? ? nil : "landmark-#{self.id.to_s}"
  end

  # Tracks an event for the account.
  def track(object_id, event)
    return sky_table.add_event(object_id, :timestamp => DateTime.now, :data => event)
  end


  ######################################
  # Action Properties
  ######################################

  # The transient properties associated with the account.
  def properties
    properties = sky_table.get_properties()
    properties.select!{|p| p.transient && p.name != 'action' }
    return properties
  end
end
