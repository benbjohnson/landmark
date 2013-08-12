class FlowStep < ActiveRecord::Base
  belongs_to :flow
  validates :flow_id, :resource, presence: true  
  attr_accessible :resource
  before_create :update_index

  def update_index
    if flow && index.to_i == 0
      self.index = flow.steps.maximum(:index).to_i + 1
    end
  end
end
