class FlowStep < ActiveRecord::Base
  belongs_to :flow
  validates :flow_id, :resource, presence: true  
  attr_accessible :resource
end
