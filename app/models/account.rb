class Account < ActiveRecord::Base
  has_many :users
  has_many :actions
  validates :name, :presence => true  
  before_create :generate_api_key

  attr_accessible :name

  ##############################################################################
  #
  # Methds
  #
  ##############################################################################

  ######################################
  # Callbacks
  ######################################

  # Generates an API key for the account.
  def generate_api_key
    self.api_key = SecureRandom.hex(16)
  end


  ######################################
  # Tracking
  ######################################

  # Tracks an event for the account.
  def sky_table
    return nil if self.new_record?
    
    if @sky_table.nil?
      client = SkyDB::Client.new(:host => 'localhost', :port => 8585)
      @sky_table = SkyDB::Table.new(:name => self.id.to_s, :client => client)
    end
    return @sky_table
  end

  # Tracks an event for the account.
  def track(object_id, event)
    return sky_table.add_event(object_id, DateTime.now, event)
  end
end
