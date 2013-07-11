class Action < ActiveRecord::Base
  belongs_to :project
  validates :name, :presence => true  
  attr_accessible :name
end
