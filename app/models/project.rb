class Project < ActiveRecord::Base
  belongs_to :account
  has_many :actions
  before_create :before_create
  after_create :after_create

  attr_accessible :name
  validates :name, presence: true

  ##############################################################################
  #
  # Methods
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

  # Creates a tracking table in Sky that is associated with this project.
  def after_create
    if !Rails.env.test?
      create_sky_table
    end
  end


  ######################################
  # API
  ######################################

  # Generates an API key for the project.
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

  # Retrieves the Sky table associated with the project.
  def sky_table
    return nil if self.new_record?
    @sky_table ||= SkyDB::Table.new(:name => self.sky_table_name, :client => sky_client)
  end

  # The name of the associated Sky table.
  def sky_table_name
    return self.new_record? ? nil : "landmark-#{self.id.to_s}"
  end

  # Creates a table for this project on the Sky database.
  def create_sky_table
    @sky_table = sky_client.create_table(:name => sky_table_name)
    @sky_table.create_property(:name => 'action', :transient => true, :data_type => 'factor')
  end

  # Tracks an event for the project.
  def track(object_id, event, options={})
    options = {:timestamp => DateTime.now}.merge(options)

    # Add action to SQL database if it doesn't exist yet.
    if !event['action'].blank?
      actions.find_or_create_by_name(event['action'])
    end

    return sky_table.add_event(object_id, :timestamp => options[:timestamp], :data => event)
  end

  # Executes a query against the project's events.
  def query(q)
    return sky_table.query(q)
  end


  ######################################
  # Properties
  ######################################

  # The non-transient properties associated with the project.
  def traits
    traits = sky_table.get_properties()
    traits.select!{|p| !p.transient }
    return traits
  end

  # The transient properties associated with the project.
  def properties
    properties = sky_table.get_properties()
    properties.select!{|p| p.transient && p.name != 'action' }
    return properties
  end


  ######################################
  # Actions
  ######################################

  # Checks if the project has any actions logged to it.
  def has_actions?
    return actions.count > 0
  end
end